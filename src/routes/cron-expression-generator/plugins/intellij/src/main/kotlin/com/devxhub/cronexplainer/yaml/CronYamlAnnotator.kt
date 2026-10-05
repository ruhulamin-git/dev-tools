package com.devxhub.cronexplainer.yaml

import com.devxhub.cronexplainer.annotateCron
import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.psi.PsiElement
import org.jetbrains.yaml.psi.YAMLScalar

/**
 * Annotates cron expressions in YAML.
 *
 * An Annotator is called for every PSI element in a file, on every edit, on a background thread.
 * That budget is the reason the cheap checks come first: the element type, then the key, and only
 * then the parser.
 */
class CronYamlAnnotator : Annotator {

    override fun annotate(element: PsiElement, holder: AnnotationHolder) {
        if (element !is YAMLScalar) return
        val dialect = YamlCronSite.dialectFor(element) ?: return

        holder.annotateCron(element.textValue, contentOffset(element), dialect, element.textRange)
    }

    /**
     * Where the scalar's value starts in the document.
     *
     * `textRange` covers the quotes when there are any, so writing an offset straight from the
     * value would land one character to the left on every quoted expression.
     */
    private fun contentOffset(scalar: YAMLScalar): Int {
        val offset = scalar.text.indexOf(scalar.textValue)
        return scalar.textRange.startOffset + if (offset >= 0) offset else 0
    }
}
