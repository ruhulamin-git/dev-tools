package com.devxhub.cronexplainer.kotlin

import com.devxhub.cronexplainer.CronCompletionContributor
import com.intellij.psi.PsiElement

/** Offers cron expressions inside `@Scheduled(cron = "...")` in Kotlin. */
class CronKotlinCompletionContributor : CronCompletionContributor() {

    override fun siteAt(position: PsiElement): Site? {
        val template = KotlinCronSite.templateAt(position) ?: return null
        val dialect = KotlinCronSite.dialectFor(template) ?: return null
        return Site(template, dialect)
    }
}
