package com.devxhub.cronexplainer

import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.fileTypes.PlainSyntaxHighlighter
import com.intellij.openapi.fileTypes.SyntaxHighlighter
import com.intellij.openapi.options.colors.AttributesDescriptor
import com.intellij.openapi.options.colors.ColorDescriptor
import com.intellij.openapi.options.colors.ColorSettingsPage
import javax.swing.Icon

/**
 * Puts the expression highlight under Settings | Editor | Color Scheme | Cron.
 *
 * Without this page the text attributes key still works, but it exists only in code: nobody can
 * find it, and a highlight you cannot turn off is a highlight some people will uninstall the
 * plugin over. Registering it costs one class and makes the colour theirs.
 */
class CronColorSettingsPage : ColorSettingsPage {

    override fun getDisplayName(): String = "Cron"

    override fun getIcon(): Icon? = null

    // The demo pane needs a highlighter for the surrounding text; there is no cron file type to
    // colour, only spans this plugin marks, so plain text is exactly right.
    override fun getHighlighter(): SyntaxHighlighter = PlainSyntaxHighlighter()

    override fun getDemoText(): String = """
        # Kubernetes CronJob
        schedule: "<cron>0 3 * * *</cron>"

        # GitHub Actions workflow
        - cron: '<cron>*/15 9-17 * * 1-5</cron>'

        # Spring @Scheduled
        @Scheduled(cron = "<cron>0 0 0 * * ?</cron>")
    """.trimIndent()

    override fun getAdditionalHighlightingTagToDescriptorMap(): Map<String, TextAttributesKey> =
        mapOf("cron" to CRON_EXPRESSION)

    override fun getAttributeDescriptors(): Array<AttributesDescriptor> =
        arrayOf(AttributesDescriptor("Cron expression", CRON_EXPRESSION))

    override fun getColorDescriptors(): Array<ColorDescriptor> = ColorDescriptor.EMPTY_ARRAY
}
