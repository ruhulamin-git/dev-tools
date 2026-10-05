package com.devxhub.cronexplainer

import com.devxhub.cronexplainer.core.Dialect

/**
 * Deciding whether a piece of text is a cron expression, and which dialect it is written in.
 *
 * This is the part a crontab-file plugin cannot do. In a crontab file every line is cron by
 * definition; everywhere else the same five fields mean different things depending on what is
 * reading them, and the surrounding key is the only clue available.
 */
object CronSite {

    /**
     * YAML keys whose value is a cron expression, and the dialect that reads it.
     *
     * All Unix so far: GitHub Actions (`on.schedule[].cron`), Kubernetes CronJob
     * (`spec.schedule`), and the various `cron:` keys CI systems use.
     */
    private val YAML_KEYS = mapOf(
        "cron" to Dialect.UNIX,
        "schedule" to Dialect.UNIX,
    )

    /** The dialect for a YAML key, or null when the key has nothing to do with scheduling. */
    fun forYamlKey(key: String?): Dialect? = YAML_KEYS[key?.lowercase()]

    /**
     * Annotation attributes whose value is a cron expression, keyed by the annotation's simple
     * name and then by the attribute name.
     *
     * Spring's `@Scheduled(cron = ...)` is Quartz-flavoured: six fields, seconds first. That is a
     * different language from the five fields in a workflow file, and `0 0 0 * * ?` is the proof -
     * a hard error read as Unix, "At 12:00 AM" read as Spring. Because the call site fixes the
     * dialect, nobody has to be asked which one they meant.
     */
    private val ANNOTATION_ATTRIBUTES: Map<String, Map<String, Dialect>> = mapOf(
        "Scheduled" to mapOf("cron" to Dialect.SECONDS),
    )

    /**
     * The dialect for an annotation attribute, or null when the attribute holds something else.
     *
     * [annotation] may be qualified or not: only the simple name is matched, because an
     * unresolved `@Scheduled` - Spring absent from the classpath, or the file not yet indexed -
     * still reports its own short name, and the annotator should work in both cases.
     */
    fun forAnnotationAttribute(annotation: String?, attribute: String?): Dialect? {
        val simple = annotation?.substringAfterLast('.') ?: return null
        return ANNOTATION_ATTRIBUTES[simple]?.get(attribute)
    }

    /**
     * Terraform properties whose value is a schedule, and the dialect that reads it.
     *
     * Two different crons in one file type. EventBridge takes six fields ending in a year and
     * numbers Sunday as 1, so `cron(0 3 ? * 2 *)` is Monday there and Tuesday in a workflow
     * file; `aws_autoscaling_schedule.recurrence` is plain Unix. Getting that wrong is a silent
     * one-day error, which is exactly the kind a description is supposed to catch.
     */
    private val HCL_PROPERTIES = mapOf(
        "schedule_expression" to Dialect.EVENTBRIDGE,
        "schedule" to Dialect.EVENTBRIDGE,
        "recurrence" to Dialect.UNIX,
    )

    /** The dialect for a Terraform property, or null when the property is not a schedule. */
    fun forHclProperty(name: String?): Dialect? = HCL_PROPERTIES[name?.lowercase()]

    /** An expression found inside a larger value, with its offset from that value's start. */
    data class Located(val text: String, val offset: Int)

    /**
     * Finds the expression inside an attribute value.
     *
     * Usually the value is the expression. AWS is the exception: it wraps schedules in a
     * function - `cron(0 3 * * ? *)` - alongside `rate(5 minutes)` and `at(...)`, which are
     * schedules but not cron and must be left alone rather than reported as broken.
     *
     * Returning the offset as well as the text is what keeps the squiggle honest: an error in
     * the third field has to land on the third field, five characters further right than the
     * quote suggests.
     */
    fun locateExpression(value: String): Located? {
        val start = value.indexOfFirst { !it.isWhitespace() }
        if (start < 0) return null
        val trimmed = value.substring(start, value.indexOfLast { !it.isWhitespace() } + 1)

        if (!trimmed.contains('(')) return Located(trimmed, start)
        if (!trimmed.startsWith(CRON_CALL, ignoreCase = true) || !trimmed.endsWith(')')) return null

        val inner = trimmed.substring(CRON_CALL.length, trimmed.length - 1)
        val innerStart = inner.indexOfFirst { !it.isWhitespace() }
        if (innerStart < 0) return null
        val innerEnd = inner.indexOfLast { !it.isWhitespace() } + 1
        return Located(inner.substring(innerStart, innerEnd), start + CRON_CALL.length + innerStart)
    }

    private const val CRON_CALL = "cron("

    /**
     * Whether text is shaped like a cron expression at all.
     *
     * A guard against noise. `schedule:` is not a reserved word, and plenty of YAML uses it for
     * something else entirely - a free-text description, a duration, a nested block. Reporting
     * an error on those would make the plugin worse than not having it, so anything that is not
     * already cron-shaped is left alone rather than flagged.
     */
    fun looksLikeCron(text: String): Boolean {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return false
        if (trimmed.startsWith("@")) return true

        val parts = trimmed.split(Regex("\\s+"))
        if (parts.size !in 5..6) return false

        // Every field has to be built from characters cron uses. A sentence that happens to be
        // five words long is not a schedule.
        return parts.all { part -> part.isNotEmpty() && part.all { it in CRON_CHARS } }
    }

    private val CRON_CHARS: Set<Char> =
        (('0'..'9') + ('A'..'Z') + ('a'..'z') + listOf('*', '?', '/', ',', '-', '#')).toSet()
}
