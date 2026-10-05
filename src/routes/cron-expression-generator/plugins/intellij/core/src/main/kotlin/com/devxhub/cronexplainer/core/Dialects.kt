package com.devxhub.cronexplainer.core

/**
 * Cron dialects.
 *
 * "6-field cron" is not one thing. Two systems can accept the same six fields and schedule
 * completely different times, because one reads a leading seconds field and the other reads a
 * trailing year. `0 18 ? * MON-FRI *` is 6pm on weekdays to AWS EventBridge, and "18 past every
 * hour" to anything expecting seconds first.
 *
 * So the dialect is asked for rather than guessed, and each one carries its own field list,
 * legend and day-of-week numbering.
 */

enum class Dialect { UNIX, SECONDS, EVENTBRIDGE }

enum class FieldName { SECOND, MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK, YEAR }

/** The character or value form, e.g. an asterisk, a slash, `SUN-SAT`. */
data class SyntaxRow(val token: String, val meaning: String)

data class FieldMeta(
    val name: FieldName,
    /** Human label shown under the field. */
    val label: String,
    /** Allowed values, shown in the field hint. */
    val range: String,
    /** What this field accepts beyond the operators every field shares. */
    val extras: List<SyntaxRow> = emptyList(),
)

data class DialectSpec(
    val id: Dialect,
    val label: String,
    /** Where you would meet this dialect. */
    val note: String,
    /** Used when the current expression has the wrong number of fields for this dialect. */
    val sample: String,
    val fields: List<FieldMeta>,
    /**
     * False when the dialect numbers day-of-week from 1 = Sunday rather than 0 = Sunday.
     * Drives the shift applied before the schedule engine sees the expression.
     */
    val dayOfWeekStartIndexZero: Boolean,
    /** Whether the `@daily` shorthands are accepted. */
    val macros: Boolean,
) {
    /** The dialect name without its field-count suffix, for use mid-sentence. */
    val shortLabel: String get() = label.substringBefore(" — ")
}

/** The operators every field in every dialect accepts. */
val COMMON_SYNTAX = listOf(
    SyntaxRow("*", "any value"),
    SyntaxRow(",", "value list separator"),
    SyntaxRow("-", "range of values"),
    SyntaxRow("/", "step values"),
)

private val MINUTE = FieldMeta(FieldName.MINUTE, "Minute", "0-59")
private val HOUR = FieldMeta(FieldName.HOUR, "Hour", "0-23")
private val DAY_OF_MONTH = FieldMeta(FieldName.DAY_OF_MONTH, "Day of month", "1-31")
private val MONTH = FieldMeta(
    FieldName.MONTH, "Month", "1-12 or JAN-DEC",
    listOf(SyntaxRow("JAN-DEC", "alternative single values")),
)
private val DAY_OF_WEEK_UNIX = FieldMeta(
    FieldName.DAY_OF_WEEK, "Day of week", "0-6 or SUN-SAT",
    listOf(
        SyntaxRow("SUN-SAT", "alternative single values"),
        SyntaxRow("7", "sunday (non-standard)"),
    ),
)

val DIALECTS: Map<Dialect, DialectSpec> = mapOf(
    Dialect.UNIX to DialectSpec(
        id = Dialect.UNIX,
        label = "Unix — 5 fields",
        note = "crontab, Kubernetes CronJob, GitHub Actions",
        sample = "*/15 9-17 * * 1-5",
        dayOfWeekStartIndexZero = true,
        macros = true,
        fields = listOf(MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK_UNIX),
    ),

    Dialect.SECONDS to DialectSpec(
        id = Dialect.SECONDS,
        label = "Seconds — 6 fields",
        note = "Spring @Scheduled, node-cron, Quartz",
        sample = "*/30 * * * * *",
        // Spring and node-cron keep Unix weekday numbering; only the seconds field is new.
        dayOfWeekStartIndexZero = true,
        macros = false,
        fields = listOf(
            FieldMeta(FieldName.SECOND, "Second", "0-59"),
            MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK_UNIX,
        ),
    ),

    Dialect.EVENTBRIDGE to DialectSpec(
        id = Dialect.EVENTBRIDGE,
        label = "AWS EventBridge — 6 fields",
        note = "EventBridge rules — trailing year, no seconds",
        sample = "0 18 ? * MON-FRI *",
        // EventBridge numbers day-of-week 1-7 with 1 = Sunday, unlike Unix.
        dayOfWeekStartIndexZero = false,
        macros = false,
        fields = listOf(
            MINUTE, HOUR,
            FieldMeta(
                FieldName.DAY_OF_MONTH, "Day of month", "1-31",
                listOf(
                    SyntaxRow("?", "no specific value"),
                    SyntaxRow("L", "last day of the month"),
                    SyntaxRow("W", "nearest weekday"),
                ),
            ),
            MONTH,
            FieldMeta(
                FieldName.DAY_OF_WEEK, "Day of week", "1-7 or SUN-SAT",
                listOf(
                    SyntaxRow("SUN-SAT", "alternative single values"),
                    SyntaxRow("1", "sunday — not Monday"),
                    SyntaxRow("?", "no specific value"),
                    SyntaxRow("#", "nth weekday of the month"),
                ),
            ),
            FieldMeta(FieldName.YEAR, "Year", "1970-2199"),
        ),
    ),
)

val DIALECT_ORDER = listOf(Dialect.UNIX, Dialect.SECONDS, Dialect.EVENTBRIDGE)

/** The spec for a dialect. Every dialect has one, so this never returns null. */
fun spec(dialect: Dialect): DialectSpec = DIALECTS.getValue(dialect)

/** Where a named field sits in this dialect, or -1 when the dialect has no such field. */
fun indexOf(dialect: Dialect, name: FieldName): Int =
    spec(dialect).fields.indexOfFirst { it.name == name }

/**
 * Shift a day-of-week field from 1 = Sunday to 0 = Sunday.
 *
 * Only value positions move. A step interval and an nth-weekday occurrence count are counts
 * rather than weekdays, so shifting them would change the schedule.
 */
fun shiftDayOfWeek(field: String): String {
    fun shiftValue(text: String): String =
        if (text.isNotEmpty() && text.all { it.isDigit() }) maxOf(0, text.toInt() - 1).toString()
        else text

    return field.split(",").joinToString(",") { part ->
        // `2#1` - shift the weekday, leave the occurrence count alone.
        val hash = part.split("#")
        // `1-5/2` - shift the range ends, leave the step alone.
        val slash = hash[0].split("/")
        val shifted = slash[0].split("-").joinToString("-", transform = ::shiftValue)

        val rejoinedSlash = (listOf(shifted) + slash.drop(1)).joinToString("/")
        (listOf(rejoinedSlash) + hash.drop(1)).joinToString("#")
    }
}

/**
 * Expand a plain numeric field into the values it matches, or null when it matches anything.
 * Used for the EventBridge year, which the schedule engine does not model.
 */
fun expandYears(field: String): List<Int>? {
    val text = field.trim()
    if (text.isEmpty() || text == "*" || text == "?") return null

    val years = sortedSetOf<Int>()
    for (part in text.split(",")) {
        val slash = part.split("/")
        val step = if (slash.size > 1) slash[1].toIntOrNull() ?: return null else 1
        if (step < 1) return null

        val dash = slash[0].split("-")
        val wildcard = dash[0] == "*"
        val start = if (wildcard) 1970 else dash[0].toIntOrNull() ?: return null
        val end = when {
            dash.size > 1 -> dash[1].toIntOrNull() ?: return null
            wildcard -> 2199
            else -> start
        }
        if (end < start) return null

        var year = start
        while (year <= end) {
            years.add(year)
            year += step
        }
    }

    return years.toList().ifEmpty { null }
}

data class Translation(
    /** An expression the schedule engine reads with the meaning the dialect intended. */
    val expression: String,
    /** Years the schedule is confined to, or null when it is not confined. */
    val years: List<Int>?,
)

/**
 * Rewrite an expression into the form the schedule engine evaluates correctly.
 *
 * Unix and seconds forms pass straight through. EventBridge does not: its trailing year is not
 * a field the engine knows, `?` means "unset", and its weekday numbering is off by one.
 */
fun translate(fields: List<String>, dialect: Dialect): Translation {
    if (dialect != Dialect.EVENTBRIDGE) return Translation(fields.joinToString(" "), null)

    fun unset(field: String) = if (field == "?") "*" else field
    val weekday = unset(fields.getOrNull(4) ?: "*")

    return Translation(
        expression = listOf(
            fields.getOrNull(0) ?: "*",
            fields.getOrNull(1) ?: "*",
            unset(fields.getOrNull(2) ?: "*"),
            fields.getOrNull(3) ?: "*",
            if (weekday == "*") "*" else shiftDayOfWeek(weekday),
        ).joinToString(" "),
        years = expandYears(fields.getOrNull(5) ?: "*"),
    )
}
