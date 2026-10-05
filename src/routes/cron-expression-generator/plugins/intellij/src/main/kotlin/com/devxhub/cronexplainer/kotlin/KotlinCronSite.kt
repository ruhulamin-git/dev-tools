package com.devxhub.cronexplainer.kotlin

import com.devxhub.cronexplainer.CronSite
import com.devxhub.cronexplainer.core.Dialect
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiTreeUtil
import org.jetbrains.kotlin.psi.KtAnnotationEntry
import org.jetbrains.kotlin.psi.KtLiteralStringTemplateEntry
import org.jetbrains.kotlin.psi.KtStringTemplateExpression
import org.jetbrains.kotlin.psi.KtValueArgument

/** Recognising a cron site in Kotlin, shared by the annotator and the completion contributor. */
internal object KotlinCronSite {

    fun templateAt(element: PsiElement): KtStringTemplateExpression? =
        PsiTreeUtil.getParentOfType(element, KtStringTemplateExpression::class.java, false)

    fun dialectFor(template: KtStringTemplateExpression): Dialect? {
        val argument = template.parent as? KtValueArgument ?: return null
        val annotation = argument.parent?.parent as? KtAnnotationEntry ?: return null
        val attribute = argument.getArgumentName()?.asName?.asString()
        return CronSite.forAnnotationAttribute(annotation.shortName?.asString(), attribute)
    }

    /**
     * The literal text of a template, or null when it has any part that is not literal.
     *
     * A Kotlin string is a sequence of entries: literal text, `$interpolations`, and escapes.
     * Only an all-literal template has text that is knowable without running the program, which
     * also disposes of `"\${report.schedule}"` - a placeholder is not a schedule.
     */
    fun literalText(template: KtStringTemplateExpression): String? {
        val entries = template.entries
        if (entries.isEmpty() || entries.any { it !is KtLiteralStringTemplateEntry }) return null
        return entries.joinToString("") { it.text }
    }
}
