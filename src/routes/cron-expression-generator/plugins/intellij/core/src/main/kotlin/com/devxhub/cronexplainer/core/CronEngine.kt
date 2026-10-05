package com.devxhub.cronexplainer.core

import com.cronutils.model.definition.CronDefinition
import com.cronutils.model.definition.CronDefinitionBuilder
import com.cronutils.model.time.ExecutionTime
import com.cronutils.parser.CronParser
import net.redhogs.cronparser.CronExpressionDescriptor
import net.redhogs.cronparser.Options
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Locale

/**
 * Cron parsing and scheduling.
 *
 * A port of the web tool's cron.ts, with one structural change. The TypeScript leans on
 * cron-parser to expand a field into the values it matches; no JVM library exposes that, so the
 * expansion is written out here. It turns out to be an improvement: errors can now name the
 * field that is wrong instead of relaying whatever a library happened to say.
 *
 * Three libraries would be two too many, so responsibilities are split rather than duplicated:
 *   - this file validates and expands fields,
 *   - cron-parser-core turns a valid expression into English,
 *   - cron-utils walks the calendar for run times.
 */

data class FieldInfo(
    val name: FieldName,
    val label: String,
    val range: String,
    /** The raw text typed for this field, or "" when not present. */
    val value: String,
)

data class CronResult(
    val valid: Boolean,
    /** Human-readable description, present when valid. */
    val description: String? = null,
    /** One entry per field in the dialect, always present so a breakdown can render. */
    val fields: List<FieldInfo> = emptyList(),
    /** The expression a macro expanded to, when the input was a macro. */
    val expandedFrom: String? = null,
    /** Present when invalid. Written for a human, not a stack trace. */
    val error: String? = null,
    /**
     * Which field the error belongs to, when it belongs to one. Lets a caller underline the
     * offending field instead of the whole expression; null for errors about the expression
     * as a whole, such as a wrong field count.
     */
    val errorField: Int? = null,
)

/**
 * Non-standard shorthands supported by most cron implementations.
 * `@reboot` is deliberately absent - it has no schedule to describe.
 */
private val MACROS = mapOf(
    "@yearly" to "0 0 1 1 *",
    "@annually" to "0 0 1 1 *",
    "@monthly" to "0 0 1 * *",
    "@weekly" to "0 0 * * 0",
    "@daily" to "0 0 * * *",
    "@midnight" to "0 0 * * *",
    "@hourly" to "0 * * * *",
)

internal val MONTH_NAMES = listOf(
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
)
internal val DAY_NAMES = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")

private val MONTH_LENGTH = listOf(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)

/** Split on any run of whitespace, ignoring leading and trailing space. */
internal fun splitFields(expression: String): List<String> {
    val trimmed = expression.trim()
    return if (trimmed.isEmpty()) emptyList() else trimmed.split(Regex("\\s+"))
}

/** Macros are a Unix convention; the 6-field dialects do not accept them. */
private fun macroFor(expression: String, dialect: Dialect): String? =
    if (!spec(dialect).macros) null else MACROS[expression.trim().lowercase()]

/** Pad or truncate to the dialect's field count so a breakdown always has something. */
private fun toFieldInfo(parts: List<String>, dialect: Dialect): List<FieldInfo> =
    spec(dialect).fields.mapIndexed { index, meta ->
        FieldInfo(meta.name, meta.label, meta.range, parts.getOrNull(index) ?: "")
    }

// ---------------------------------------------------------------------------
// Field expansion
// ---------------------------------------------------------------------------

data class FieldExpansion(
    /** The matching numbers, de-duplicated and sorted. */
    val numbers: List<Int>,
    /** Non-numeric values kept as written, such as `L` for the last day of the month. */
    val literals: List<String>,
    /** Lowest and highest the field can go, and how many values that spans. */
    val min: Int,
    val max: Int,
    val span: Int,
    /** True when the field matches every value it possibly could. */
    val all: Boolean,
)

private data class Bounds(val min: Int, val max: Int)

/** Day-of-week accepts 7 as a second spelling of Sunday, so it validates one past its span. */
private fun boundsFor(name: FieldName): Bounds = when (name) {
    FieldName.SECOND -> Bounds(0, 59)
    FieldName.MINUTE -> Bounds(0, 59)
    FieldName.HOUR -> Bounds(0, 23)
    FieldName.DAY_OF_MONTH -> Bounds(1, 31)
    FieldName.MONTH -> Bounds(1, 12)
    FieldName.DAY_OF_WEEK -> Bounds(0, 7)
    FieldName.YEAR -> Bounds(1970, 2199)
}

/** A single value: a number, or a month/weekday name where the field takes names. */
private fun valueOf(token: String, name: FieldName): Int? {
    if (token.isEmpty()) return null
    token.toIntOrNull()?.let { return it }

    val upper = token.uppercase()
    return when (name) {
        FieldName.MONTH -> MONTH_NAMES.indexOf(upper).takeIf { it >= 0 }?.plus(1)
        FieldName.DAY_OF_WEEK -> DAY_NAMES.indexOf(upper).takeIf { it >= 0 }
        else -> null
    }
}

/**
 * Expand one field's raw text into the values it matches.
 *
 * Returns null when the text is not something cron accepts, which is what makes this the
 * validator as well as the expander.
 */
internal fun expandRaw(raw: String, name: FieldName): FieldExpansion? {
    val bounds = boundsFor(name)
    val isDayOfWeek = name == FieldName.DAY_OF_WEEK
    val span = if (isDayOfWeek) DAY_NAMES.size else bounds.max - bounds.min + 1

    val text = raw.trim()
    if (text.isEmpty()) return null

    // `?` means "no specific value", which for expansion purposes is the same as `*`.
    val normalised = if (text == "?") "*" else text

    val numbers = sortedSetOf<Int>()
    val literals = mutableListOf<String>()

    for (part in normalised.split(",")) {
        if (part.isEmpty()) return null

        // `L`, `15W` and `2#1` are position markers rather than plain values. They are kept
        // as written so a caller can see them, and left out of the numeric reasoning.
        if (part.any { it == 'L' || it == 'W' || it == '#' }) {
            literals.add(part)
            continue
        }

        val slash = part.split("/")
        if (slash.size > 2) return null
        val step = if (slash.size > 1) (slash[1].toIntOrNull() ?: return null) else 1
        if (step < 1) return null

        val rangeText = slash[0]
        val dash = rangeText.split("-")
        if (dash.size > 2) return null

        val start: Int
        val end: Int
        when {
            rangeText == "*" -> {
                start = bounds.min
                end = if (isDayOfWeek) DAY_NAMES.size - 1 else bounds.max
            }

            dash.size == 2 -> {
                start = valueOf(dash[0], name) ?: return null
                end = valueOf(dash[1], name) ?: return null
            }

            else -> {
                val single = valueOf(rangeText, name) ?: return null
                start = single
                // `5/10` counts from 5 to the end of the field; a bare `5` is just itself.
                end = if (slash.size > 1) bounds.max else single
            }
        }

        if (end < start) return null
        if (start < bounds.min || end > bounds.max) return null

        var value = start
        while (value <= end) {
            numbers.add(if (isDayOfWeek) value % 7 else value)
            value += step
        }
    }

    if (numbers.isEmpty() && literals.isEmpty()) return null

    return FieldExpansion(
        numbers = numbers.toList(),
        literals = literals,
        min = bounds.min,
        // Day of week validates up to 7, but 7 is a second spelling of 0, not an eighth day.
        max = if (isDayOfWeek) DAY_NAMES.size - 1 else bounds.max,
        span = span,
        // A field carrying a literal is never "everything", however many numbers came with it.
        all = literals.isEmpty() && numbers.size == span,
    )
}

/**
 * The raw expansion of a field by position, for callers reasoning over numbers rather than
 * displaying them - the schedule linter, mainly.
 */
fun expandFieldRaw(expression: String, index: Int, dialect: Dialect = Dialect.UNIX): FieldExpansion? {
    val meta = spec(dialect).fields.getOrNull(index) ?: return null

    val raw = expression.trim()
    val effective = macroFor(raw, dialect) ?: raw
    val parts = splitFields(effective)
    val value = parts.getOrNull(index) ?: return null

    if (meta.name == FieldName.YEAR) {
        val years = expandYears(value)
        return FieldExpansion(
            numbers = years ?: emptyList(),
            literals = emptyList(),
            min = 1970,
            max = 2199,
            span = 2199 - 1970 + 1,
            all = years == null,
        )
    }

    // Expansion always works in 0 = Sunday terms, so an EventBridge weekday has to be
    // renumbered first. Without this, `2-6` expands to TUE-SAT instead of the MON-FRI that
    // EventBridge means by it.
    val normalised =
        if (dialect == Dialect.EVENTBRIDGE && meta.name == FieldName.DAY_OF_WEEK && value != "?") {
            shiftDayOfWeek(value)
        } else {
            value
        }

    return expandRaw(normalised, meta.name)
}

data class FieldValues(
    /** One label per matching value - names for month and day of week, numbers elsewhere. */
    val labels: List<String>,
    /** True when the field matches every value it possibly could. */
    val all: Boolean,
)

fun expandField(expression: String, index: Int, dialect: Dialect = Dialect.UNIX): FieldValues? {
    val expansion = expandFieldRaw(expression, index, dialect) ?: return null
    val name = spec(dialect).fields[index].name

    val labels = expansion.numbers.map { value ->
        when (name) {
            FieldName.MONTH -> MONTH_NAMES[value - 1]
            // Weekdays are always shown by name: the numbering differs between dialects, the
            // names do not, so a name can never be read as the wrong day.
            FieldName.DAY_OF_WEEK -> DAY_NAMES[value]
            else -> value.toString()
        }
    }

    return FieldValues(labels + expansion.literals, expansion.all)
}

/**
 * Everything the given field accepts, for a legend shown against a field.
 * Static per field - it describes the syntax, not whatever happens to be typed.
 */
fun fieldSyntax(index: Int, dialect: Dialect = Dialect.UNIX): List<SyntaxRow> {
    val meta = spec(dialect).fields.getOrNull(index) ?: return emptyList()
    // `1-12 or JAN-DEC` reads as two rows in a legend, and the names row is already an extra.
    val allowed = meta.range.substringBefore(" or ")
    return COMMON_SYNTAX + SyntaxRow(allowed, "allowed values") + meta.extras
}

/**
 * The character range `[start, end)` a field occupies in the raw expression, so a caller can
 * point at one field rather than the whole string.
 *
 * Returns null when the field is not there to point at: an index outside the dialect's fields,
 * an expression too short to have one, or a macro - a macro's fields appear nowhere in the
 * text that was actually written.
 */
fun fieldRangeAt(expression: String, index: Int, dialect: Dialect = Dialect.UNIX): IntRange? {
    if (index < 0 || index >= spec(dialect).fields.size) return null
    if (expression.trim().startsWith("@")) return null

    var position = 0
    for (match in Regex("\\S+").findAll(expression)) {
        if (position == index) return match.range.first until (match.range.last + 1)
        position++
    }
    return null
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Reject names that belong to a different field.
 *
 * `0 18 ? * MON-FRI *` is an EventBridge schedule. Read as a seconds-first expression its
 * fields still look individually plausible, so the mismatch has to be caught by asking whether
 * each name landed in a field that takes names at all.
 */
private fun nameError(parts: List<String>, dialect: Dialect): Pair<String, Int>? {
    for ((index, meta) in spec(dialect).fields.withIndex()) {
        val names = Regex("[A-Za-z]+").findAll(parts.getOrNull(index) ?: "").map { it.value }

        for (name in names) {
            val upper = name.uppercase()
            // `L` and `W` are position markers rather than names, where the field allows them.
            if (meta.extras.any { it.token == upper }) continue

            val allowed = when (meta.name) {
                FieldName.MONTH -> MONTH_NAMES
                FieldName.DAY_OF_WEEK -> DAY_NAMES
                else -> emptyList()
            }
            if (upper in allowed) continue

            // Naming where the value *does* belong is more use than saying where it does not.
            val belongs = when {
                upper in DAY_NAMES -> "a day name — it belongs in the day-of-week field"
                upper in MONTH_NAMES -> "a month name — it belongs in the month field"
                else -> "not a value cron understands"
            }

            return "The ${meta.label.lowercase()} field does not accept \"$name\". " +
                "That is $belongs." to index
        }
    }
    return null
}

/** A field count that belongs to a different dialect is a nudge, not just a miscount. */
private fun wrongCountHint(count: Int, dialect: Dialect): String {
    val others = DIALECT_ORDER
        .filter { it != dialect && spec(it).fields.size == count }
        .map { spec(it).shortLabel }
    if (others.isEmpty()) return ""

    return " $count fields is the shape of ${others.joinToString(" or ")} — " +
        "switch dialect if that is what you meant."
}

/**
 * Say what is wrong with a field, not merely that something is.
 *
 * The expander returns null for every kind of bad input, which is all a validator needs but
 * poor advice. The two shapes worth naming are the ones people write on purpose and misread:
 * a backwards range, and a zero step.
 */
private fun fieldErrorFor(raw: String, meta: FieldMeta): String {
    for (part in raw.split(",")) {
        val slash = part.split("/")

        if (slash.size > 1 && slash[1].toIntOrNull() == 0) {
            return "A step of 0 is not a repeat interval. Use */1 or higher."
        }

        val dash = slash[0].split("-")
        if (dash.size == 2) {
            val start = valueOf(dash[0], meta.name)
            val end = valueOf(dash[1], meta.name)
            if (start != null && end != null && end < start) {
                return "The range ${slash[0]} runs backwards. " +
                    "Ranges go from the lower value to the higher one."
            }
        }
    }

    return "The ${meta.label.lowercase()} field does not accept \"$raw\". Allowed: ${meta.range}."
}

/** A day that exists in none of the selected months is a schedule that can never run. */
private fun impossibleDate(parts: List<String>, dialect: Dialect): Pair<String, Int>? {
    val domIndex = indexOf(dialect, FieldName.DAY_OF_MONTH)
    val monthIndex = indexOf(dialect, FieldName.MONTH)
    if (domIndex < 0 || monthIndex < 0) return null

    val dayOfMonth = expandRaw(parts[domIndex], FieldName.DAY_OF_MONTH) ?: return null
    val month = expandRaw(parts[monthIndex], FieldName.MONTH) ?: return null
    if (dayOfMonth.all || dayOfMonth.numbers.isEmpty()) return null

    val reachable = month.numbers.any { m ->
        dayOfMonth.numbers.any { day -> day <= MONTH_LENGTH[m - 1] }
    }
    if (reachable) return null

    return "That day never occurs in the month you picked, so this schedule would never run." to
        domIndex
}

/** cron-parser-core writes lowercase am/pm and unpadded hours; cronstrue's shape is nicer. */
private val CLOCK = Regex("""\b(\d{1,2}):(\d{2}) ?([ap]m)\b""", RegexOption.IGNORE_CASE)

private fun polish(text: String): String = CLOCK.replace(text) { match ->
    val hour = match.groupValues[1].padStart(2, '0')
    "$hour:${match.groupValues[2]} ${match.groupValues[3].uppercase()}"
}

private val DAY_LABEL = listOf(
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
)

private fun listOfNames(items: List<String>): String = when (items.size) {
    0 -> ""
    1 -> items[0]
    else -> items.dropLast(1).joinToString(", ") + " and " + items.last()
}

/**
 * Put the weekday back into a description that dropped it.
 *
 * When both day fields are restricted the describer mentions only the day of month, which
 * hides the OR between them - the rule people misread most often, and the one this tool exists
 * to surface. `5 4 4 9 6` means the 4th of September *and* every Saturday in September, and a
 * description that says only "on day 4" is actively misleading.
 */
private fun withWeekday(description: String, expression: String, dialect: Dialect): String {
    val domIndex = indexOf(dialect, FieldName.DAY_OF_MONTH)
    val dowIndex = indexOf(dialect, FieldName.DAY_OF_WEEK)
    if (domIndex < 0 || dowIndex < 0) return description

    val dayOfMonth = expandFieldRaw(expression, domIndex, dialect) ?: return description
    val dayOfWeek = expandFieldRaw(expression, dowIndex, dialect) ?: return description
    if (dayOfMonth.all || dayOfWeek.all || dayOfWeek.numbers.isEmpty()) return description

    val names = dayOfWeek.numbers.map { DAY_LABEL[it] }
    // Only add it when the describer really did leave it out.
    if (names.any { description.contains(it) }) return description

    return "$description, and on ${listOfNames(names)}"
}

private fun describe(expression: String, zeroBasedDayOfWeek: Boolean): String? = runCatching {
    val options = Options().apply {
        isZeroBasedDayOfWeek = zeroBasedDayOfWeek
        isTwentyFourHourTime = false
        isVerbose = false
    }
    polish(CronExpressionDescriptor.getDescription(expression, options, Locale.UK))
}.getOrNull()

/**
 * Validate an expression and describe it in English.
 *
 * Returns a result rather than throwing - callers re-parse on every edit, and most edits land
 * on a half-typed, invalid expression.
 */
fun parseCron(expression: String, dialect: Dialect = Dialect.UNIX): CronResult {
    val spec = spec(dialect)
    val fieldCount = spec.fields.size

    val raw = expression.trim()
    val macro = macroFor(raw, dialect)
    val effective = macro ?: raw
    val parts = splitFields(effective)
    val fields = toFieldInfo(parts, dialect)

    fun invalid(message: String, field: Int? = null) =
        CronResult(valid = false, fields = fields, error = message, errorField = field)

    if (raw.isEmpty()) return invalid("Enter a cron expression to see what it means.")

    if (raw.lowercase() == "@reboot") {
        return invalid("@reboot runs once at startup, so it has no schedule to preview.")
    }

    if (raw.startsWith("@")) {
        if (!spec.macros) {
            return invalid(
                "${spec.shortLabel} does not accept @ shorthands. " +
                    "Switch to Unix, or write the schedule out in full.",
            )
        }
        if (macro == null) {
            return invalid(
                "Unknown shorthand \"$raw\". Try @hourly, @daily, @weekly, @monthly, or @yearly.",
            )
        }
    }

    if (parts.size != fieldCount) {
        val noun = if (parts.size == 1) "field" else "fields"
        return invalid(
            "${spec.shortLabel} needs $fieldCount fields, but this has ${parts.size} $noun." +
                wrongCountHint(parts.size, dialect),
        )
    }

    nameError(parts, dialect)?.let { (message, field) -> return invalid(message, field) }

    // Every field has to expand before the expression can be called valid. This is where a bad
    // range, a zero step or a stray character is caught, and it can say which field it was.
    for ((index, meta) in spec.fields.withIndex()) {
        if (meta.name == FieldName.YEAR) {
            if (parts[index] != "*" && parts[index] != "?" && expandYears(parts[index]) == null) {
                return invalid("The year field does not accept \"${parts[index]}\".", index)
            }
            continue
        }
        if (expandRaw(parts[index], meta.name) == null) {
            return invalid(fieldErrorFor(parts[index], meta), index)
        }
    }

    impossibleDate(parts, dialect)?.let { (message, field) -> return invalid(message, field) }

    val translation = translate(parts, dialect)
    // EventBridge is renumbered to 0 = Sunday by translate(), so the describer is always told
    // the expression it receives is zero-based, whatever the dialect's own convention is.
    // Joined from the split fields rather than passed through as typed: the describer does not
    // cope with the runs of whitespace that `0   0  *  *  *` is allowed to contain.
    val describeThis =
        if (dialect == Dialect.EVENTBRIDGE) translation.expression else parts.joinToString(" ")
    val description = describe(describeThis, zeroBasedDayOfWeek = true)
        ?: return invalid("That expression contains characters cron does not understand.")

    // The year is not part of the expression the describer saw, so it is added here.
    val years = translation.years
    val withYear = when {
        years == null -> description
        years.size == 1 -> "$description, in ${years[0]} only"
        else -> "$description, in ${years.joinToString(", ")} only"
    }

    return CronResult(
        valid = true,
        description = withWeekday(withYear, effective, dialect),
        fields = fields,
        expandedFrom = if (macro != null) raw else null,
    )
}

// ---------------------------------------------------------------------------
// Run times
// ---------------------------------------------------------------------------

/** Guard on a year-filtered scan so an unreachable year cannot spin. */
private const val MAX_SCAN = 10_000

/**
 * A cron definition matching what this tool accepts.
 *
 * Built by hand rather than taken from `CronType`, because the stock UNIX definition rejects
 * `L` and `#`, which the web tool has always supported.
 */
private fun definitionFor(dialect: Dialect): CronDefinition {
    val builder = CronDefinitionBuilder.defineCron()
    if (dialect == Dialect.SECONDS) builder.withSeconds().and()

    return builder
        .withMinutes().and()
        .withHours().and()
        // supportsQuestionMark() is deliberately absent from both day fields. Enabling it
        // silently switches cron-utils from OR to AND semantics between day-of-month and
        // day-of-week, which is the single most misread rule in cron and would make
        // `5 4 4 9 6` fire only on the Septembers whose 4th is a Saturday. Nothing needs it
        // here: translate() rewrites `?` to `*` before the expression reaches this parser.
        .withDayOfMonth().supportsL().supportsW().and()
        .withMonth().and()
        // 0 = Sunday, matching the form translate() produces for every dialect.
        .withDayOfWeek().withValidRange(0, 7).withMondayDoWValue(1)
        .supportsHash().supportsL().and()
        .instance()
}

/** `?` means "no specific value", which the parser above is not configured to accept. */
private fun withoutQuestionMarks(expression: String): String =
    splitFields(expression).joinToString(" ") { if (it == "?") "*" else it }

/**
 * The next [count] run times for an expression.
 *
 * [from] is passed in rather than read from the clock so that callers stay testable and
 * deterministic. [zone] is the timezone the *schedule* is interpreted in.
 */
fun getNextRuns(
    expression: String,
    from: ZonedDateTime,
    count: Int = 5,
    zone: ZoneId = from.zone,
    dialect: Dialect = Dialect.UNIX,
): List<ZonedDateTime> {
    val raw = expression.trim()
    val effective = macroFor(raw, dialect) ?: raw
    val (translated, years) = translate(splitFields(effective), dialect)

    return runCatching {
        val cron = CronParser(definitionFor(dialect)).parse(withoutQuestionMarks(translated))
        val schedule = ExecutionTime.forCron(cron)

        val runs = mutableListOf<ZonedDateTime>()
        var cursor = from.withZoneSameInstant(zone)
        // A year field can rule out long stretches of the calendar, so walk forward with a
        // hard cap and stop as soon as the last allowed year is behind us.
        val lastYear = years?.lastOrNull()

        var scanned = 0
        while (runs.size < count && scanned < MAX_SCAN) {
            scanned++
            val next = schedule.nextExecution(cursor).orElse(null) ?: break
            cursor = next

            val year = next.year
            if (lastYear != null && year > lastYear) break
            if (years == null || year in years) runs.add(next)
        }
        runs.toList()
    }.getOrElse { emptyList() }
}
