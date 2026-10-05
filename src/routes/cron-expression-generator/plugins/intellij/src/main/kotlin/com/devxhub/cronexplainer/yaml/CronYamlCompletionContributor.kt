package com.devxhub.cronexplainer.yaml

import com.devxhub.cronexplainer.CronCompletionContributor
import com.intellij.psi.PsiElement

/** Offers cron expressions after a `cron:` or `schedule:` key. */
class CronYamlCompletionContributor : CronCompletionContributor() {

    override fun siteAt(position: PsiElement): Site? {
        val scalar = YamlCronSite.scalarAt(position) ?: return null
        val dialect = YamlCronSite.dialectFor(scalar) ?: return null
        return Site(scalar, dialect, quoted = YamlCronSite.isQuoted(scalar))
    }
}
