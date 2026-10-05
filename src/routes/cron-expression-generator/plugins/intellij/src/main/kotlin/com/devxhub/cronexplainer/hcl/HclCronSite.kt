package com.devxhub.cronexplainer.hcl

import com.devxhub.cronexplainer.CronSite
import com.devxhub.cronexplainer.core.Dialect
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiTreeUtil
import org.intellij.terraform.hcl.psi.HCLProperty
import org.intellij.terraform.hcl.psi.HCLStringLiteral

/** Recognising a cron site in Terraform, shared by the annotator and the completion contributor. */
internal object HclCronSite {

    fun literalAt(element: PsiElement): HCLStringLiteral? =
        PsiTreeUtil.getParentOfType(element, HCLStringLiteral::class.java, false)

    fun dialectFor(literal: HCLStringLiteral): Dialect? =
        CronSite.forHclProperty((literal.parent as? HCLProperty)?.name)
}
