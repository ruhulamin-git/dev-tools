package com.devxhub.cronexplainer

import com.devxhub.cronexplainer.core.Dialect
import com.devxhub.cronexplainer.core.fieldRangeAt
import com.devxhub.cronexplainer.core.getNextRuns
import com.devxhub.cronexplainer.core.lintSchedule
import com.devxhub.cronexplainer.core.parseCron
import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.openapi.editor.colors.EditorColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.util.TextRange
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * The colour the expression itself is painted in.
 *
 * Falling back to the injected-fragment background rather than naming a colour means the
 * highlight is whatever the active theme already uses to say "this string is really a small
 * program" - correct in light and dark, and in themes neither of us has seen. Users can still
 * override it under Editor | Color Scheme, because it is a key of our own.
 */
internal val CRON_EXPRESSION: TextAttributesKey = TextAttributesKey.createTextAttributesKey(
    "CRON_EXPRESSION",
    EditorColors.INJECTED_LANGUAGE_FRAGMENT,
)

private val RUN_FORMAT: DateTimeFormatter =
    DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm", Locale.ENGLISH)

/** How many upcoming runs the hover shows. Enough to see the rhythm, short enough to read. */
private const val PREVIEW_RUNS = 5

/**
 * Turning a cron expression into annotations.
 *
 * Every language needs the same three things said about an expression - the error, the
 * description, the warnings - and differs only in how the text is found. Keeping that here means
 * a new language costs a recogniser and nothing else, and that the Java and YAML halves cannot
 * quietly drift into disagreeing about the same expression.
 *
 * The locating and the shape guard live here rather than in each annotator: whether a value is
 * cron-shaped, and whether it is wrapped in AWS's `cron(...)`, has nothing to do with the
 * language the value was written in.
 *
 * @param value the attribute's value, quotes already stripped
 * @param valueStart document offset of that value's first character
 * @param whole range to fall back to when the expression cannot be located precisely
 */
internal fun AnnotationHolder.annotateCron(
    value: String,
    valueStart: Int,
    dialect: Dialect,
    whole: TextRange,
) {
    val located = CronSite.locateExpression(value) ?: return
    val text = located.text
    if (!CronSite.looksLikeCron(text)) return

    val base = valueStart + located.offset
    val result = parseCron(text, dialect)

    // The expression without its quotes. Highlighting the quotes too would look like a mistake,
    // and it is the content that the description is about.
    val content = TextRange(base, base + text.length)
        .takeIf { whole.contains(it) } ?: whole

    if (!result.valid) {
        val error = result.error ?: return
        newAnnotation(HighlightSeverity.ERROR, error)
            .range(fieldRange(text, base, result.errorField, dialect, content))
            .create()
        return
    }

    // INFORMATION carries no squiggle, which is what lets it hold the highlight and the hover
    // for an expression that is perfectly fine.
    result.description?.let { description ->
        newAnnotation(HighlightSeverity.INFORMATION, description)
            .range(content)
            .tooltip(tooltip(description, text, dialect))
            .textAttributes(CRON_EXPRESSION)
            .create()
    }

    // The part a syntax checker cannot do: these expressions are all perfectly legal.
    for (warning in lintSchedule(text, result, dialect)) {
        newAnnotation(HighlightSeverity.WARNING, "${warning.title}. ${warning.detail}")
            .range(content)
            .tooltip("<b>${escape(warning.title)}.</b> ${escape(warning.detail)}")
            .create()
    }
}

/**
 * The hover.
 *
 * The description answers "what does this say"; the run times answer "so when does it actually
 * fire", which is the question that sends people to a website. Concrete dates also settle the
 * arguments prose cannot - that a day-of-month and day-of-week expression fires on both, or that
 * the 29th of February is four years away.
 */
private fun tooltip(description: String, expression: String, dialect: Dialect): String {
    val zone = ZoneId.systemDefault()
    val runs = runCatching {
        getNextRuns(expression, ZonedDateTime.now(zone), PREVIEW_RUNS, zone, dialect)
    }.getOrDefault(emptyList())

    val html = StringBuilder("<b>Cron explanation:</b> ${escape(description)}")
    if (runs.isNotEmpty()) {
        html.append("<br/><br/><b>Next runs</b> <i>(${escape(zone.id)})</i>:<br/><br/>")
        runs.joinTo(html, separator = "<br/>") { escape(RUN_FORMAT.format(it)) }
    }
    return html.toString()
}

/**
 * Underline the field at fault where the engine identified one, and the whole expression
 * otherwise. Pointing at `24` in `0 24 * * *` says more than underlining the whole line.
 */
private fun fieldRange(
    text: String,
    base: Int,
    field: Int?,
    dialect: Dialect,
    fallback: TextRange,
): TextRange {
    if (field == null) return fallback
    val range = fieldRangeAt(text, field, dialect) ?: return fallback
    return TextRange(base + range.first, base + range.last + 1)
}

/**
 * Tooltips are HTML, and cron is full of characters HTML reads as markup - `<`, `&`, and the
 * `*` that is fine but sits beside them. Escaping here rather than trusting the input keeps a
 * stray angle bracket in a description from swallowing the rest of the popup.
 */
private fun escape(text: String): String =
    text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
