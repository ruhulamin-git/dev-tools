package com.devxhub.cronexplainer.hcl

import com.devxhub.cronexplainer.annotateCron
import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.psi.PsiElement
import org.intellij.terraform.hcl.psi.HCLStringLiteral

/**
 * Annotates cron expressions in Terraform.
 *
 * Registered against HCL rather than Terraform so it covers plain `.hcl` files too; the
 * Terraform language extends HCL, so one registration serves both and registering both would
 * annotate every expression twice.
 */
class CronHclAnnotator : Annotator {

    override fun annotate(element: PsiElement, holder: AnnotationHolder) {
        if (element !is HCLStringLiteral) return
        val dialect = HclCronSite.dialectFor(element) ?: return

        holder.annotateCron(element.value, contentOffset(element), dialect, element.textRange)
    }

    /**
     * Where the string's content starts. HCL quotes with `"` and, for heredocs, with rather
     * more, so the offset is found rather than assumed.
     */
    private fun contentOffset(literal: HCLStringLiteral): Int {
        val offset = literal.text.indexOf(literal.value)
        return literal.textRange.startOffset + if (offset >= 0) offset else 1
    }
}
