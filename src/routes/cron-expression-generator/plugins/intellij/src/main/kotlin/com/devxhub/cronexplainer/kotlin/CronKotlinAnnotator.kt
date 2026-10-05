package com.devxhub.cronexplainer.kotlin

import com.devxhub.cronexplainer.annotateCron
import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.psi.PsiElement
import org.jetbrains.kotlin.psi.KtStringTemplateExpression

/**
 * Annotates cron expressions in Kotlin annotations - Spring's `@Scheduled`, same as the Java side.
 *
 * A separate class rather than a shared one because Java and Kotlin share no PSI: a Kotlin string
 * is a template built from entries, not a literal with a value. Only the recognising differs,
 * though - everything said about the expression comes from the same annotateCron.
 */
class CronKotlinAnnotator : Annotator {

    override fun annotate(element: PsiElement, holder: AnnotationHolder) {
        if (element !is KtStringTemplateExpression) return
        val dialect = KotlinCronSite.dialectFor(element) ?: return
        val text = KotlinCronSite.literalText(element) ?: return

        // Entries start after the opening quote, whether that is one character or three, so the
        // offset comes from the PSI rather than from counting quotes.
        val start = element.entries.first().textRange.startOffset
        holder.annotateCron(text, start, dialect, element.textRange)
    }
}
