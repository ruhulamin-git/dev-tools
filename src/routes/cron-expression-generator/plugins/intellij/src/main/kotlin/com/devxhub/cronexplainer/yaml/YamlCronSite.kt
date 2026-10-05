package com.devxhub.cronexplainer.yaml

import com.devxhub.cronexplainer.CronSite
import com.devxhub.cronexplainer.core.Dialect
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiTreeUtil
import org.jetbrains.yaml.psi.YAMLKeyValue
import org.jetbrains.yaml.psi.YAMLScalar
import org.jetbrains.yaml.psi.YAMLSequenceItem

/** Recognising a cron site in YAML, shared by the annotator and the completion contributor. */
internal object YamlCronSite {

    fun scalarAt(element: PsiElement): YAMLScalar? =
        PsiTreeUtil.getParentOfType(element, YAMLScalar::class.java, false)

    fun dialectFor(scalar: YAMLScalar): Dialect? = CronSite.forYamlKey(keyFor(scalar))

    /** Whether the scalar is quoted. Plain YAML scalars are not, and have no quote to skip. */
    fun isQuoted(scalar: YAMLScalar): Boolean = scalar.text.firstOrNull() in setOf('"', '\'')

    /**
     * The key governing this scalar.
     *
     * Two shapes have to work. Kubernetes writes the value directly against the key:
     *
     *     schedule: "0 3 * * *"
     *
     * GitHub Actions wraps it in a sequence, so the scalar's parent is a sequence item and the
     * key is one level further up:
     *
     *     schedule:
     *       - cron: "0 3 * * *"
     */
    private fun keyFor(scalar: YAMLScalar): String? {
        val parent = scalar.parent
        if (parent is YAMLKeyValue) return parent.keyText

        val item = PsiTreeUtil.getParentOfType(scalar, YAMLSequenceItem::class.java)
        if (item != null) {
            PsiTreeUtil.getParentOfType(item, YAMLKeyValue::class.java)?.let { return it.keyText }
        }
        return null
    }
}
