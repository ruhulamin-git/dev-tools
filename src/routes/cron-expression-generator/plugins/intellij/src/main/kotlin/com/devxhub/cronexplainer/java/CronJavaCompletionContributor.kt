package com.devxhub.cronexplainer.java

import com.devxhub.cronexplainer.CronCompletionContributor
import com.intellij.psi.PsiElement

/** Offers cron expressions inside `@Scheduled(cron = "...")` in Java. */
class CronJavaCompletionContributor : CronCompletionContributor() {

    override fun siteAt(position: PsiElement): Site? {
        val literal = JavaCronSite.literalAt(position) ?: return null
        val dialect = JavaCronSite.dialectFor(literal) ?: return null
        return Site(literal, dialect)
    }
}
