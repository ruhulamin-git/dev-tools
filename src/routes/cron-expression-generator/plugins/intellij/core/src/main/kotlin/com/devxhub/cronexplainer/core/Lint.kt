package com.devxhub.cronexplainer.core

/**
 * Schedule warnings.
 *
 * These are not syntax errors - every expression that reaches here parses cleanly and would be
 * accepted by cron. They are the schedules that do something other than what the person writing
 * them almost certainly meant. That is the gap this tool fills over a plain validator: syntax
 * checkers say "this is legal", not "this is not what you think".
 */

enum class WarningId { UNEVEN_STEP, DAY_OR, SHORT_MONTH, ON_THE_HOUR }

data class ScheduleWarning(
    /** Stable identifier, so a rule can be tested and suppressed by name. */
    val id: WarningId,
    val title: String,
    val detail: String,
)

/**
 * Keyed by field name rather than position: the seconds dialect shifts every field along by
 * one, so an index that means "hour" in Unix means "minute" there.
 */
private val FIELD_LABEL = mapOf(
    FieldName.SECOND to "second",
    FieldName.MINUTE to "minute",
    FieldName.HOUR to "hour",
    FieldName.DAY_OF_MONTH to "day-of-month",
    FieldName.MONTH to "month",
    FieldName.DAY_OF_WEEK to "day-of-week",
)

/** What one full cycle of each field is, for describing where a step wraps. */
private val CYCLE = mapOf(
    FieldName.SECOND to "the minute",
    FieldName.MINUTE to "the hour",
    FieldName.HOUR to "the day",
    FieldName.DAY_OF_MONTH to "the month",
    FieldName.MONTH to "the year",
    FieldName.DAY_OF_WEEK to "the week",
)

/** The unit a gap in each field is counted in. */
private val UNIT = mapOf(
    FieldName.SECOND to "second",
    FieldName.MINUTE to "minute",
    FieldName.HOUR to "hour",
    FieldName.DAY_OF_MONTH to "day",
    FieldName.MONTH to "month",
    FieldName.DAY_OF_WEEK to "day",
)

private val MONTH_LENGTH = listOf(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)

private val MONTH_LABEL = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)

private fun plural(count: Int, noun: String): String = "$count $noun${if (count == 1) "" else "s"}"

private fun ordinal(day: Int): String = when (day) {
    1, 21, 31 -> "${day}st"
    2, 22 -> "${day}nd"
    3, 23 -> "${day}rd"
    else -> "${day}th"
}

private fun list(items: List<String>): String = when (items.size) {
    0 -> ""
    1 -> items[0]
    else -> items.dropLast(1).joinToString(", ") + " and " + items.last()
}

/**
 * A step that does not divide its field evenly leaves a short gap at the wrap.
 *
 * `*​/7` in the minute field is the classic: :00 :07 ... :56, then straight back to :00, so the
 * interval across the hour boundary is 4 minutes, not 7. Only steps are checked - an explicit
 * list like `0,7,14` is uneven by choice, and warning about it would be noise.
 */
private fun unevenStep(
    expression: String,
    result: CronResult,
    dialect: Dialect,
): ScheduleWarning? {
    for ((index, field) in result.fields.withIndex()) {
        // The year has no enclosing cycle to wrap around, so a step in it cannot be uneven.
        val cycle = CYCLE[field.name] ?: continue
        val unit = UNIT[field.name] ?: continue

        val raw = field.value
        if (!raw.contains("/")) continue

        val expansion = expandFieldRaw(expression, index, dialect) ?: continue
        if (expansion.numbers.size < 2) continue

        val values = expansion.numbers
        val step = values[1] - values[0]
        val wrap = values[0] + expansion.span - values.last()
        if (wrap == step) continue

        val preview = if (values.size > 4) {
            "${values.take(3).joinToString(", ")} … ${values.last()}"
        } else {
            values.joinToString(", ")
        }

        return ScheduleWarning(
            id = WarningId.UNEVEN_STEP,
            title = "The step in ${FIELD_LABEL[field.name]} does not divide $cycle evenly",
            detail = "$raw matches $preview. After ${values.last()} it restarts at " +
                "${values[0]}, so the gap across $cycle is ${plural(wrap, unit)}, not $step.",
        )
    }
    return null
}

/** Both day fields restricted means OR, which is the single most misread rule in cron. */
private fun dayOr(expression: String, dialect: Dialect): ScheduleWarning? {
    val domIndex = indexOf(dialect, FieldName.DAY_OF_MONTH)
    val dowIndex = indexOf(dialect, FieldName.DAY_OF_WEEK)

    val dayOfMonth = expandFieldRaw(expression, domIndex, dialect) ?: return null
    val dayOfWeek = expandFieldRaw(expression, dowIndex, dialect) ?: return null
    if (dayOfMonth.all || dayOfWeek.all) return null

    val days = expandField(expression, domIndex, dialect)?.labels ?: emptyList()
    val weekdays = expandField(expression, dowIndex, dialect)?.labels ?: emptyList()

    return ScheduleWarning(
        id = WarningId.DAY_OR,
        title = "Day of month and day of week are both restricted",
        detail = "Cron ORs these two fields rather than ANDing them, so the job runs whenever " +
            "either matches: on ${list(days.map { "day $it" })} of the month, and separately " +
            "on every ${list(weekdays)} — not only when the two coincide.",
    )
}

/** Days 29-31 do not exist in every month, and cron skips the months that lack them. */
private fun shortMonth(expression: String, dialect: Dialect): ScheduleWarning? {
    val dayOfMonth = expandFieldRaw(expression, indexOf(dialect, FieldName.DAY_OF_MONTH), dialect)
        ?: return null
    val month = expandFieldRaw(expression, indexOf(dialect, FieldName.MONTH), dialect)
        ?: return null

    // `*` covers the 1st, so it never misses a month, and `L` resolves per month by definition.
    // Neither is a schedule pinned to a day that might not exist.
    if (dayOfMonth.all || dayOfMonth.numbers.isEmpty()) return null

    // A month is only skipped when *none* of the chosen days exist in it. `15,31` still runs in
    // February on the 15th, so it is not skipped and there is nothing to warn about.
    val missing = month.numbers.filter { m ->
        dayOfMonth.numbers.none { day -> day <= MONTH_LENGTH[m - 1] }
    }
    if (missing.isEmpty()) return null

    val day = dayOfMonth.numbers.min()

    // February does have a 29th, just not three years in four.
    if (day == 29 && missing == listOf(2)) {
        return ScheduleWarning(
            id = WarningId.SHORT_MONTH,
            title = "February only has a 29th in leap years",
            detail = "This schedule runs in February once every four years. Every other year " +
                "it is skipped silently — there is no error and no substitute date.",
        )
    }

    val names = missing.map { MONTH_LABEL[it - 1] }
    return ScheduleWarning(
        id = WarningId.SHORT_MONTH,
        title = "Day $day does not exist in every month this runs",
        detail = "${list(names)} ${if (missing.size == 1) "has" else "have"} no ${ordinal(day)}, " +
            "so the job is skipped ${if (missing.size == 1) "that month" else "in those months"} " +
            "with no error. For month-end work, schedule the 1st and subtract a day in your code.",
    )
}

/** Everything scheduled on minute 0 of every hour lands in the same busy minute. */
private fun onTheHour(
    expression: String,
    result: CronResult,
    dialect: Dialect,
): ScheduleWarning? {
    val hour = expandFieldRaw(expression, indexOf(dialect, FieldName.HOUR), dialect)
    if (hour?.all != true) return null

    val minute = result.fields.getOrNull(indexOf(dialect, FieldName.MINUTE))
    if (minute?.value != "0") return null

    // A seconds dialect firing at second 0 of minute 0 is the same herd; anything else in the
    // seconds field means the job is already offset, so there is nothing to say.
    val secondIndex = indexOf(dialect, FieldName.SECOND)
    if (secondIndex != -1 && result.fields[secondIndex].value != "0") return null

    return ScheduleWarning(
        id = WarningId.ON_THE_HOUR,
        title = "Firing exactly on the hour",
        detail = "Minute 0 is the busiest minute on most machines, because it is where everyone " +
            "puts their hourly jobs. Offsetting to an arbitrary minute spreads the load and " +
            "makes a slow run less likely to collide with the next one.",
    )
}

/**
 * Every warning that applies to an expression, most-specific first.
 *
 * Returns nothing for an expression that does not parse - a broken expression already has an
 * error message, and piling advisories on top of it would bury the actual problem.
 */
fun lintSchedule(
    expression: String,
    result: CronResult,
    dialect: Dialect = Dialect.UNIX,
): List<ScheduleWarning> {
    if (!result.valid) return emptyList()

    return listOfNotNull(
        unevenStep(expression, result, dialect),
        dayOr(expression, dialect),
        shortMonth(expression, dialect),
        onTheHour(expression, result, dialect),
    )
}
