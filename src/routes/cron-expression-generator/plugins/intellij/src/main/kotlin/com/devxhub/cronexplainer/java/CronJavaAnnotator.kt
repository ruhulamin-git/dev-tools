package com.devxhub.cronexplainer.java

import com.devxhub.cronexplainer.annotateCron
import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiLiteralExpression

/**
 * Annotates cron expressions in Java annotations - today that means Spring's `@Scheduled`.
 *
 * An Annotator runs for every PSI element on every edit, so the cheap tests come first and the
 * parser only ever sees text that already looks like a schedule.
 */
class CronJavaAnnotator : Annotator {

    override fun annotate(element: PsiElement, holder: AnnotationHolder) {
        if (element !is PsiLiteralExpression) return
        val text = element.value as? String ?: return
        val dialect = JavaCronSite.dialectFor(element) ?: return

        holder.annotateCron(text, contentOffset(element, text), dialect, element.textRange)
    }

    /**
     * Where the string's content starts in the document.
     *
     * `textRange` covers the quotes, and a text block opens with three of them plus a newline,
     * so the offset is taken from the text rather than assumed.
     */
    private fun contentOffset(literal: PsiLiteralExpression, text: String): Int {
        val offset = literal.text.indexOf(text)
        return literal.textRange.startOffset + if (offset >= 0) offset else 1
    }
}
