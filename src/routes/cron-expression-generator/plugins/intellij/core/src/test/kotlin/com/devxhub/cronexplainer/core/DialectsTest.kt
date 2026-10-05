package com.devxhub.cronexplainer.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * Ported from dialects.test.ts. The assertions are deliberately identical to the TypeScript
 * ones: they are what proves the port is faithful rather than merely plausible.
 */
class DialectsTest {

    @Nested
    @DisplayName("shiftDayOfWeek")
    inner class ShiftDayOfWeek {

        @Test
        fun `shifts plain values from 1 = Sunday to 0 = Sunday`() {
            assertEquals("0", shiftDayOfWeek("1"))
            assertEquals("6", shiftDayOfWeek("7"))
        }

        @Test
        fun `shifts both ends of a range`() {
            // EventBridge MON-FRI is 2-6; Unix MON-FRI is 1-5.
            assertEquals("1-5", shiftDayOfWeek("2-6"))
        }

        @Test
        fun `shifts every item of a list`() {
            assertEquals("0,3,6", shiftDayOfWeek("1,4,7"))
        }

        @Test
        fun `leaves a step interval alone - it is a count, not a weekday`() {
            assertEquals("1-5/2", shiftDayOfWeek("2-6/2"))
        }

        @Test
        fun `leaves an nth-weekday count alone`() {
            // `2#1` is the first Monday in EventBridge; Unix spells that `1#1`.
            assertEquals("1#1", shiftDayOfWeek("2#1"))
        }

        @Test
        fun `leaves names untouched`() {
            assertEquals("MON-FRI", shiftDayOfWeek("MON-FRI"))
            assertEquals("*", shiftDayOfWeek("*"))
        }
    }

    @Nested
    @DisplayName("expandYears")
    inner class ExpandYears {

        @Test
        fun `treats a wildcard as unconstrained`() {
            assertNull(expandYears("*"))
            assertNull(expandYears("?"))
        }

        @Test
        fun `reads a single year, a range and a list`() {
            assertEquals(listOf(2027), expandYears("2027"))
            assertEquals(listOf(2027, 2028, 2029), expandYears("2027-2029"))
            assertEquals(listOf(2027, 2030), expandYears("2027,2030"))
        }

        @Test
        fun `reads a step`() {
            assertEquals(listOf(2020, 2025, 2030), expandYears("2020-2030/5"))
        }

        @Test
        fun `rejects a backwards range rather than guessing`() {
            assertNull(expandYears("2030-2020"))
        }
    }

    @Nested
    @DisplayName("translate")
    inner class Translate {

        @Test
        fun `passes Unix and seconds forms through untouched`() {
            assertEquals(
                Translation("*/15 9-17 * * 1-5", null),
                translate(listOf("*/15", "9-17", "*", "*", "1-5"), Dialect.UNIX),
            )
            assertEquals(
                Translation("0 */15 9-17 * * 1-5", null),
                translate(listOf("0", "*/15", "9-17", "*", "*", "1-5"), Dialect.SECONDS),
            )
        }

        @Test
        fun `drops the year, unsets the question mark, and renumbers the weekday`() {
            assertEquals(
                Translation("0 18 * * 1-5", null),
                translate(listOf("0", "18", "?", "*", "2-6", "*"), Dialect.EVENTBRIDGE),
            )
        }

        @Test
        fun `keeps the year constraint aside rather than discarding it`() {
            assertEquals(
                listOf(2027),
                translate(listOf("0", "12", "1", "1", "?", "2027"), Dialect.EVENTBRIDGE).years,
            )
        }
    }

    @Nested
    @DisplayName("dialect specs")
    inner class Specs {

        @Test
        fun `gives Unix five fields and the 6-field dialects six`() {
            assertEquals(5, spec(Dialect.UNIX).fields.size)
            assertEquals(6, spec(Dialect.SECONDS).fields.size)
            assertEquals(6, spec(Dialect.EVENTBRIDGE).fields.size)
        }

        @Test
        fun `names the seconds dialect's first field Second`() {
            assertEquals("Second", spec(Dialect.SECONDS).fields[0].label)
        }

        @Test
        fun `puts the year last in EventBridge and nowhere else`() {
            assertEquals(5, indexOf(Dialect.EVENTBRIDGE, FieldName.YEAR))
            assertEquals(-1, indexOf(Dialect.UNIX, FieldName.YEAR))
            assertEquals(-1, indexOf(Dialect.SECONDS, FieldName.YEAR))
        }

        @Test
        fun `shifts every field along by one in the seconds dialect`() {
            // The reason the linter keys on field name rather than index.
            assertEquals(0, indexOf(Dialect.UNIX, FieldName.MINUTE))
            assertEquals(1, indexOf(Dialect.SECONDS, FieldName.MINUTE))
        }

        @Test
        fun `warns in the legend that EventBridge 1 is Sunday`() {
            val sunday = spec(Dialect.EVENTBRIDGE).fields[4].extras.find { it.token == "1" }
            assert(sunday!!.meaning.contains("not Monday")) { "got: ${sunday.meaning}" }
        }

        @Test
        fun `offers the question mark only where it is accepted`() {
            val eventbridge = spec(Dialect.EVENTBRIDGE).fields[4].extras.map { it.token }
            val unix = spec(Dialect.UNIX).fields[4].extras.map { it.token }
            assert(eventbridge.contains("?"))
            assert(eventbridge.contains("#"))
            assert(!unix.contains("?"))
        }

        @Test
        fun `numbers weekdays from zero everywhere except EventBridge`() {
            assert(spec(Dialect.UNIX).dayOfWeekStartIndexZero)
            assert(spec(Dialect.SECONDS).dayOfWeekStartIndexZero)
            assert(!spec(Dialect.EVENTBRIDGE).dayOfWeekStartIndexZero)
        }

        @Test
        fun `accepts macros only under Unix`() {
            assert(spec(Dialect.UNIX).macros)
            assert(!spec(Dialect.SECONDS).macros)
            assert(!spec(Dialect.EVENTBRIDGE).macros)
        }

        @Test
        fun `trims the field count off the label for mid-sentence use`() {
            assertEquals("Unix", spec(Dialect.UNIX).shortLabel)
            assertEquals("AWS EventBridge", spec(Dialect.EVENTBRIDGE).shortLabel)
        }
    }
}
