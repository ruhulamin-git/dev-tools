package com.devxhub.cronexplainer.hcl

import com.devxhub.cronexplainer.CronCompletionContributor
import com.devxhub.cronexplainer.core.Dialect
import com.intellij.psi.PsiElement

/** Offers cron expressions for Terraform schedule properties. */
class CronHclCompletionContributor : CronCompletionContributor() {

    override fun siteAt(position: PsiElement): Site? {
        val literal = HclCronSite.literalAt(position) ?: return null
        val dialect = HclCronSite.dialectFor(literal) ?: return null
        return Site(literal, dialect)
    }

    /**
     * EventBridge properties take the expression wrapped: `cron(0 3 * * ? *)`. Terraform rejects
     * a bare one, so completing to it would hand the user something that does not apply.
     * `recurrence` is plain Unix cron and takes no wrapper.
     */
    override fun lookupText(site: Site, expression: String): String =
        if (site.dialect == Dialect.EVENTBRIDGE) "cron($expression)" else expression
}
