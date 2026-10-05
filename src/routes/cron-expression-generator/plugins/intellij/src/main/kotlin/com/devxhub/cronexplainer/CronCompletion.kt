package com.devxhub.cronexplainer

import com.devxhub.cronexplainer.core.Dialect
import com.devxhub.cronexplainer.core.parseCron
import com.devxhub.cronexplainer.core.presets
import com.intellij.codeInsight.completion.CompletionContributor
import com.intellij.codeInsight.completion.CompletionParameters
import com.intellij.codeInsight.completion.CompletionResultSet
import com.intellij.codeInsight.completion.PlainPrefixMatcher
import com.intellij.codeInsight.completion.PrioritizedLookupElement
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.psi.PsiElement
import java.util.concurrent.ConcurrentHashMap

/**
 * Offers cron expressions, with what they mean, inside a string that is going to hold one.
 *
 * The counterpart to the annotators: those explain an expression once it exists, this one saves
 * the trip to a website to go and find it. Same engine behind both, so the description in the
 * popup is the description on hover.
 *
 * Subclasses supply only the recognising - which element is the string, and which dialect the
 * surrounding code reads it in.
 */
abstract class CronCompletionContributor : CompletionContributor() {

    /** The string literal under [position] together with its dialect, or null if not a cron site. */
    protected abstract fun siteAt(position: PsiElement): Site?

    /**
     * What actually gets inserted, which is not always the expression itself: AWS wants it
     * wrapped in `cron(...)`, and completing to a bare expression there would produce something
     * Terraform rejects. The description is still taken from the expression, so the popup
     * explains the schedule rather than the wrapper.
     */
    protected open fun lookupText(site: Site, expression: String): String = expression

    /**
     * @param literal the whole string element, quotes included
     * @param quoted whether that element's first character is a quote to be skipped
     */
    protected data class Site(val literal: PsiElement, val dialect: Dialect, val quoted: Boolean = true)

    final override fun fillCompletionVariants(
        parameters: CompletionParameters,
        result: CompletionResultSet,
    ) {
        val site = siteAt(parameters.position) ?: return

        // Cron is spaces and asterisks, which the default prefix matcher does not treat as part
        // of a word: left alone it would match on the last token only, so typing `0 0 ` would
        // offer everything. Matching against the whole string so far is what makes the list
        // narrow as an expression is built up.
        val start = site.literal.textRange.startOffset + if (site.quoted) 1 else 0
        if (parameters.offset < start) return
        val typed = parameters.position.containingFile.text.substring(start, parameters.offset)

        val matched = result.withPrefixMatcher(PlainPrefixMatcher(typed))
        val options = presets(site.dialect)

        options.forEachIndexed { index, expression ->
            val description = describe(site.dialect, expression) ?: return@forEachIndexed
            val element = LookupElementBuilder.create(lookupText(site, expression))
                // Right-aligned grey, the platform's own idiom for "what this is" - and the
                // reason the list reads as an answer rather than a menu of syntax.
                .withTypeText(description, true)
                .withCaseSensitivity(false)
            // The presets are ordered by how often they are actually wanted; without a priority
            // the platform would re-sort them alphabetically and bury `@daily` under `*/10`.
            matched.addElement(
                PrioritizedLookupElement.withPriority(element, (options.size - index).toDouble()),
            )
        }
    }

    private companion object {
        /**
         * Descriptions are stable for a fixed set of presets, and completion re-runs on every
         * keystroke - so they are computed once rather than a few dozen times a second.
         */
        val DESCRIPTIONS = ConcurrentHashMap<Pair<Dialect, String>, String>()

        fun describe(dialect: Dialect, expression: String): String? =
            DESCRIPTIONS.computeIfAbsent(dialect to expression) {
                parseCron(expression, dialect).description ?: ""
            }.ifEmpty { null }
    }
}
