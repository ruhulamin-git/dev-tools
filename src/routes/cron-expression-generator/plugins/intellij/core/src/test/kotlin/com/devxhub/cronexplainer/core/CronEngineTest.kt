package com.devxhub.cronexplainer.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.ZoneOffset
import java.time.ZonedDateTime

/** Ported from cron.test.ts and the cross-dialect half of dialects.test.ts. */
class CronEngineTest {

    private val utc = ZoneOffset.UTC

    private fun at(iso: String): ZonedDateTime = ZonedDateTime.parse(iso)

    /** Run times as `yyyy-MM-ddTHH:mm:ss`, so assertions read like the TypeScript ones. */
    private fun runs(
        expression: String,
        from: String,
        count: Int = 5,
        dialect: Dialect = Dialect.UNIX,
    ): List<String> =
        getNextRuns(expression, at(from), count, utc, dialect)
            .map { it.withZoneSameInstant(utc).toLocalDateTime().toString() }

    private fun assertContains(haystack: String?, needle: String) {
        assertNotNull(haystack, "expected a value, got null")
        assertTrue(haystack!!.contains(needle, ignoreCase = true)) {
            "expected \"$needle\" in: $haystack"
        }
    }

    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("valid expressions")
    inner class Valid {

        @Test
        fun `describes every minute`() {
            val result = parseCron("* * * * *")
            assertTrue(result.valid)
            assertEquals("Every minute", result.description)
        }

        @Test
        fun `describes daily midnight`() {
            assertContains(parseCron("0 0 * * *").description, "12:00 AM")
        }

        @Test
        fun `handles step and range operators together`() {
            val result = parseCron("*/15 9-17 * * 1-5")
            assertTrue(result.valid)
            assertContains(result.description, "Every 15 minutes")
            assertContains(result.description, "Monday through Friday")
        }

        @Test
        fun `accepts month and day names`() {
            assertTrue(parseCron("0 0 * JAN MON").valid)
        }

        @Test
        fun `accepts value lists`() {
            assertTrue(parseCron("15 2,14 * * *").valid)
        }

        @Test
        fun `tolerates irregular whitespace between fields`() {
            val result = parseCron("  0   0  *  *  *  ")
            assertTrue(result.valid)
            assertEquals(listOf("0", "0", "*", "*", "*"), result.fields.map { it.value })
        }

        @Test
        fun `always returns five labelled fields`() {
            val result = parseCron("5 4 * * *")
            assertEquals(5, result.fields.size)
            assertEquals(
                listOf(
                    FieldName.MINUTE, FieldName.HOUR, FieldName.DAY_OF_MONTH,
                    FieldName.MONTH, FieldName.DAY_OF_WEEK,
                ),
                result.fields.map { it.name },
            )
        }

        @Test
        fun `accepts the last day of the month only where the dialect allows it`() {
            // Vixie cron has no `L`; Quartz and EventBridge do. The legend is the authority,
            // so this is refused under Unix and accepted under EventBridge.
            assertFalse(parseCron("0 0 L * *", Dialect.UNIX).valid)

            val eventbridge = parseCron("0 0 L * ? *", Dialect.EVENTBRIDGE)
            assertTrue(eventbridge.valid) { "error was: ${eventbridge.error}" }
            assertContains(eventbridge.description, "last day of the month")
        }
    }

    @Nested
    @DisplayName("day-of-month / day-of-week OR logic")
    inner class DayOr {

        @Test
        fun `mentions both the day of month and the weekday`() {
            val result = parseCron("5 4 4 9 6")
            assertTrue(result.valid)
            assertContains(result.description, "day 4 of the month")
            assertContains(result.description, "Saturday")
            assertContains(result.description, "September")
        }

        @Test
        fun `fires on either match, not only on days satisfying both`() {
            val days = getNextRuns("5 4 4 9 6", at("2026-09-01T00:00:00Z"), 5, utc)
                .map { it.dayOfMonth }
            assertTrue(days.contains(4)) { "expected the 4th among $days" }
            assertTrue(days.any { it != 4 }) { "expected a non-4th among $days" }
        }
    }

    @Nested
    @DisplayName("macros")
    inner class Macros {

        @Test
        fun `expands @daily`() {
            val result = parseCron("@daily")
            assertTrue(result.valid)
            assertEquals("@daily", result.expandedFrom)
            assertEquals(listOf("0", "0", "*", "*", "*"), result.fields.map { it.value })
        }

        @Test
        fun `is case-insensitive`() {
            assertTrue(parseCron("@DAILY").valid)
        }

        @Test
        fun `rejects @reboot with an explanation`() {
            val result = parseCron("@reboot")
            assertFalse(result.valid)
            assertContains(result.error, "startup")
        }

        @Test
        fun `rejects unknown shorthands`() {
            assertContains(parseCron("@fortnightly").error, "@hourly")
        }
    }

    @Nested
    @DisplayName("invalid expressions")
    inner class Invalid {

        @Test
        fun `reports an empty input without sounding like an error`() {
            assertContains(parseCron("   ").error, "Enter a cron expression")
        }

        @Test
        fun `rejects four fields and says how many it found`() {
            val error = parseCron("* * * *").error
            assertContains(error, "needs 5 fields")
            assertContains(error, "has 4 fields")
        }

        @Test
        fun `rejects six fields and points at the dialect that takes them`() {
            val error = parseCron("0 0 0 * * *").error
            assertContains(error, "needs 5 fields")
            assertContains(error, "Seconds or AWS EventBridge")
        }

        @Test
        fun `rejects out-of-range values in every numeric field`() {
            assertFalse(parseCron("60 * * * *").valid)
            assertFalse(parseCron("0 24 * * *").valid)
            assertFalse(parseCron("0 0 32 * *").valid)
            assertFalse(parseCron("0 0 * 13 *").valid)
        }

        @Test
        fun `rejects a backwards range and explains the direction`() {
            val error = parseCron("0 0 * * 5-1").error
            assertContains(error, "runs backwards")
            assertContains(error, "5-1")
        }

        @Test
        fun `rejects a zero step and suggests a real interval`() {
            assertContains(parseCron("*/0 * * * *").error, "*/1 or higher")
        }

        @Test
        fun `rejects a date that can never occur, in plain language`() {
            // February has no 31st, so this schedule would never fire.
            val error = parseCron("0 0 31 2 *").error
            assertContains(error, "never occurs")
            assertFalse(error!!.contains("definition", ignoreCase = true))
        }

        @Test
        fun `names the field that is wrong`() {
            assertContains(parseCron("60 * * * *").error, "minute")
            assertContains(parseCron("0 24 * * *").error, "hour")
        }

        @Test
        fun `never leaks a raw Error prefix into the message`() {
            for (bad in listOf("60 * * * *", "0 0 31 2 *", "*/0 * * * *", "a b c d e")) {
                assertFalse(parseCron(bad).error!!.startsWith("Error:")) { bad }
            }
        }

        @Test
        fun `rejects free text`() {
            assertFalse(parseCron("every tuesday please").valid)
        }

        @Test
        fun `still returns five fields when invalid, so a breakdown keeps rendering`() {
            assertEquals(5, parseCron("60 * * * *").fields.size)
        }
    }

    @Nested
    @DisplayName("getNextRuns")
    inner class NextRuns {

        @Test
        fun `returns the requested number of runs`() {
            assertEquals(5, runs("*/15 * * * *", "2026-09-02T10:07:00Z").size)
        }

        @Test
        fun `computes runs relative to the date it is given, not the clock`() {
            assertEquals(
                listOf(
                    "2026-09-02T10:15", "2026-09-02T10:30", "2026-09-02T10:45",
                ),
                runs("*/15 9-17 * * 1-5", "2026-09-02T10:07:00Z", 3),
            )
        }

        @Test
        fun `returns strictly increasing times`() {
            val times = getNextRuns("0 0 * * *", at("2026-09-02T10:00:00Z"), 5, utc)
            for (index in 1 until times.size) {
                assertTrue(times[index] > times[index - 1])
            }
        }

        @Test
        fun `skips Feb 29 in non-leap years`() {
            // 2028 and 2032 are the next leap years; 2027 has no Feb 29 to land on.
            assertEquals(
                listOf("2028-02-29T00:00", "2032-02-29T00:00"),
                runs("0 0 29 2 *", "2026-01-01T00:00:00Z", 2),
            )
        }

        @Test
        fun `skips months that have no 31st`() {
            val times = getNextRuns("0 0 31 * *", at("2026-04-01T00:00:00Z"), 3, utc)
            val months = times.map { it.monthValue }
            assertFalse(months.contains(4)) { "April has no 31st, got $months" }
            assertFalse(months.contains(6)) { "June has no 31st, got $months" }
            assertTrue(times.all { it.dayOfMonth == 31 })
        }

        @Test
        fun `crosses a year boundary`() {
            val years = getNextRuns("0 0 1 1 *", at("2026-06-01T00:00:00Z"), 2, utc).map { it.year }
            assertEquals(listOf(2027, 2028), years)
        }

        @Test
        fun `resolves macros`() {
            assertEquals(listOf("2026-09-02T11:00"), runs("@hourly", "2026-09-02T10:07:00Z", 1))
        }

        @Test
        fun `returns an empty list for an invalid expression instead of throwing`() {
            assertEquals(emptyList<String>(), runs("nonsense", "2026-01-01T00:00:00Z"))
        }
    }

    // -----------------------------------------------------------------------
    // The reason dialects exist at all: the same six fields, read two ways.
    // -----------------------------------------------------------------------

    @Nested
    @DisplayName("the 6-field ambiguity")
    inner class Ambiguity {

        private val expression = "0 18 ? * MON-FRI *"

        @Test
        fun `reads an EventBridge expression as 6pm, not as 18 past the hour`() {
            val result = parseCron(expression, Dialect.EVENTBRIDGE)
            assertTrue(result.valid) { "error was: ${result.error}" }
            assertContains(result.description, "06:00 PM")

            assertEquals(
                listOf("2026-01-01T18:00", "2026-01-02T18:00"),
                runs(expression, "2026-01-01T00:00:00Z", 2, Dialect.EVENTBRIDGE),
            )
        }

        @Test
        fun `does not accept that expression as a seconds-first schedule`() {
            assertFalse(parseCron(expression, Dialect.SECONDS).valid)
        }

        @Test
        fun `rejects it outright under Unix, which has five fields`() {
            assertFalse(parseCron(expression, Dialect.UNIX).valid)
        }
    }

    @Nested
    @DisplayName("seconds dialect")
    inner class Seconds {

        @Test
        fun `describes and schedules a sub-minute interval`() {
            val result = parseCron("*/30 * * * * *", Dialect.SECONDS)
            assertTrue(result.valid) { "error was: ${result.error}" }
            assertContains(result.description, "30 seconds")

            assertEquals(
                listOf("2026-01-01T00:00:30", "2026-01-01T00:01", "2026-01-01T00:01:30"),
                runs("*/30 * * * * *", "2026-01-01T00:00:00Z", 3, Dialect.SECONDS),
            )
        }

        @Test
        fun `names its first field Second`() {
            assertEquals("Second", parseCron("0 */5 * * * *", Dialect.SECONDS).fields[0].label)
        }

        @Test
        fun `refuses macros, which are a Unix convention`() {
            val result = parseCron("@daily", Dialect.SECONDS)
            assertFalse(result.valid)
            assertContains(result.error, "does not accept @ shorthands")
        }
    }

    @Nested
    @DisplayName("EventBridge weekday numbering")
    inner class EventBridgeWeekdays {

        @Test
        fun `reads 1 as Sunday, where Unix reads it as Monday`() {
            assertContains(parseCron("0 12 ? * 1 *", Dialect.EVENTBRIDGE).description, "Sunday")
            assertContains(parseCron("0 12 * * 1", Dialect.UNIX).description, "Monday")
        }

        @Test
        fun `schedules the day it described, not the Unix one`() {
            // 2026-01-04 is a Sunday; 2026-01-05 is the Monday after it.
            assertEquals(
                listOf("2026-01-04T12:00"),
                runs("0 12 ? * 1 *", "2026-01-01T00:00:00Z", 1, Dialect.EVENTBRIDGE),
            )
            assertEquals(
                listOf("2026-01-05T12:00"),
                runs("0 12 * * 1", "2026-01-01T00:00:00Z", 1, Dialect.UNIX),
            )
        }

        @Test
        fun `labels weekdays by name, which cannot be misread between dialects`() {
            assertEquals(
                listOf("MON", "TUE", "WED", "THU", "FRI"),
                expandField("0 12 ? * 2-6 *", 4, Dialect.EVENTBRIDGE)?.labels,
            )
        }
    }

    @Nested
    @DisplayName("EventBridge year field")
    inner class EventBridgeYear {

        @Test
        fun `confines the schedule to the years given`() {
            assertEquals(
                listOf("2027-01-01T12:00", "2029-01-01T12:00"),
                runs("0 12 1 1 ? 2027,2029", "2026-01-01T00:00:00Z", 4, Dialect.EVENTBRIDGE),
            )
        }

        @Test
        fun `returns nothing when every allowed year is in the past`() {
            assertEquals(
                emptyList<String>(),
                runs("0 12 1 1 ? 2020", "2026-01-01T00:00:00Z", 5, Dialect.EVENTBRIDGE),
            )
        }

        @Test
        fun `expands the year field for a breakdown`() {
            assertEquals(
                listOf("2027", "2028", "2029"),
                expandField("0 12 1 1 ? 2027-2029", 5, Dialect.EVENTBRIDGE)?.labels,
            )
            assertEquals(true, expandField("0 12 1 1 ? *", 5, Dialect.EVENTBRIDGE)?.all)
        }

        @Test
        fun `says which years the schedule is confined to`() {
            assertContains(
                parseCron("0 12 1 1 ? 2027", Dialect.EVENTBRIDGE).description,
                "in 2027 only",
            )
        }
    }

    @Nested
    @DisplayName("field expansion")
    inner class Expansion {

        @Test
        fun `expands a wildcard to everything and marks it as such`() {
            val minute = expandFieldRaw("* * * * *", 0)!!
            assertEquals(60, minute.numbers.size)
            assertTrue(minute.all)
        }

        @Test
        fun `treats 0 and 7 as the same Sunday`() {
            val dow = expandFieldRaw("0 0 * * 0,7", 4)!!
            assertEquals(listOf(0), dow.numbers)
            assertFalse(dow.all)
        }

        @Test
        fun `keeps a literal out of the numbers and off the all flag`() {
            val dayOfMonth = expandFieldRaw("0 0 L * *", 2)!!
            assertEquals(listOf("L"), dayOfMonth.literals)
            assertTrue(dayOfMonth.numbers.isEmpty())
            assertFalse(dayOfMonth.all)
        }

        @Test
        fun `reads a step from a starting value to the end of the field`() {
            assertEquals(listOf(5, 25, 45), expandFieldRaw("5/20 * * * *", 0)!!.numbers)
        }

        @Test
        fun `labels months and weekdays by name`() {
            assertEquals(listOf("JAN", "JUL"), expandField("0 0 * 1,7 *", 3)?.labels)
            assertEquals(listOf("MON", "TUE"), expandField("0 0 * * 1-2", 4)?.labels)
        }
    }

    @Nested
    @DisplayName("fieldSyntax and fieldRangeAt")
    inner class Legend {

        @Test
        fun `gives Unix weekday 0-6 and EventBridge weekday 1-7`() {
            assertTrue(fieldSyntax(4, Dialect.UNIX).map { it.token }.contains("0-6"))
            assertTrue(fieldSyntax(4, Dialect.EVENTBRIDGE).map { it.token }.contains("1-7"))
        }

        @Test
        fun `describes the seconds field first in the seconds dialect`() {
            assertTrue(fieldSyntax(0, Dialect.SECONDS).map { it.token }.contains("0-59"))
            assertEquals(emptyList<SyntaxRow>(), fieldSyntax(6, Dialect.SECONDS))
        }

        @Test
        fun `points at the characters a field occupies`() {
            val expression = "*/15 9-17 * * 1-5"
            assertEquals(0 until 4, fieldRangeAt(expression, 0))
            assertEquals(5 until 9, fieldRangeAt(expression, 1))
            assertEquals(14 until 17, fieldRangeAt(expression, 4))
        }

        @Test
        fun `refuses to point inside a macro, whose fields are not written down`() {
            assertNull(fieldRangeAt("@daily", 0))
        }

        @Test
        fun `refuses an index the dialect does not have`() {
            assertNull(fieldRangeAt("*/15 9-17 * * 1-5", 5))
        }
    }
}
