package com.devxhub.cronexplainer.java

import com.devxhub.cronexplainer.CronSite
import com.devxhub.cronexplainer.core.Dialect
import com.intellij.psi.PsiAnnotation
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiLiteralExpression
import com.intellij.psi.PsiNameValuePair
import com.intellij.psi.util.PsiTreeUtil

/**
 * Recognising a cron site in Java, shared by the annotator and the completion contributor.
 *
 * They need the same answer from different starting points - the annotator is handed the literal,
 * completion is handed a leaf inside it - which is the whole reason this is not just a private
 * method on one of them.
 */
internal object JavaCronSite {

    fun literalAt(element: PsiElement): PsiLiteralExpression? =
        PsiTreeUtil.getParentOfType(element, PsiLiteralExpression::class.java, false)

    /** The dialect this literal is read in, or null when it is not a schedule at all. */
    fun dialectFor(literal: PsiLiteralExpression): Dialect? {
        val pair = literal.parent as? PsiNameValuePair ?: return null
        val annotation = pair.parent?.parent as? PsiAnnotation ?: return null
        // `name` is null for the implicit `value =`, which no scheduling attribute uses.
        return CronSite.forAnnotationAttribute(annotation.qualifiedName, pair.name)
    }
}
