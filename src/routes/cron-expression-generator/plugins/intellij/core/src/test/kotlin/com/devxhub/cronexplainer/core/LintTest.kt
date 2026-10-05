package com.devxhub.cronexplainer.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/** Ported from lint.test.ts. */
class LintTest {

    private fun lint(expression: String, dialect: Dialect = Dialect.UNIX): List<ScheduleWarning> =
        lintSchedule(expression, parseCron(expression, dialect), dialect)

    private fun ids(expression: String, dialect: Dialect = Dialect.UNIX): List<WarningId> =
        lint(expression, dialect).map { it.id }

    private fun assertContains(haystack: String, needle: String) {
        assertTrue(haystack.contains(needle)) { "expected \"$needle\" in: $haystack" }
    }

    @Nested
    @DisplayName("lintSchedule")
    inner class Overall {

        @Test
        fun `says nothing about a schedule with nothing wrong with it`() {
            assertEquals(emptyList<ScheduleWarning>(), lint("*/15 9-17 * * 1-5"))
            assertEquals(emptyList<ScheduleWarning>(), lint("0 3 * * *"))
            assertEquals(emptyList<ScheduleWarning>(), lint("30 6 * * 1-5"))
        }

        @Test
        fun `stays quiet while the expression is invalid`() {
            // A broken expression already has an error; advisories on top would bury it.
            assertEquals(emptyList<ScheduleWarning>(), lint("0 0 31 2 *"))
            assertEquals(emptyList<ScheduleWarning>(), lint("nonsense"))
            assertEquals(emptyList<ScheduleWarning>(), lint(""))
        }
    }

    @Nested
    @DisplayName("uneven step")
    inner class UnevenStep {

        @Test
        fun `flags a minute step that does not divide the hour`() {
            val warning = lint("*/7 * * * *").first()
            assertEquals(WarningId.UNEVEN_STEP, warning.id)
            // 0, 7 ... 56, then 0 again: four minutes across the boundary, not seven.
            assertContains(warning.detail, "4 minutes")
            assertContains(warning.detail, "not 7")
        }

        @Test
        fun `flags an hour step that does not divide the day`() {
            // 0, 5, 10, 15, 20 then 0 - a four-hour gap overnight.
            val warning = lint("0 */5 * * *").first()
            assertEquals(WarningId.UNEVEN_STEP, warning.id)
            assertContains(warning.detail, "4 hours")
        }

        @Test
        fun `stays quiet when the step divides evenly`() {
            assertFalse(ids("*/15 * * * *").contains(WarningId.UNEVEN_STEP))
            assertFalse(ids("*/30 * * * *").contains(WarningId.UNEVEN_STEP))
            assertFalse(ids("0 */6 * * *").contains(WarningId.UNEVEN_STEP))
        }

        @Test
        fun `ignores an explicit list, which is uneven on purpose`() {
            assertFalse(ids("0,7,14 * * * *").contains(WarningId.UNEVEN_STEP))
        }
    }

    @Nested
    @DisplayName("day-of-month / day-of-week OR")
    inner class DayOr {

        @Test
        fun `flags both day fields being restricted`() {
            val warning = lint("0 0 1 * 1").first()
            assertEquals(WarningId.DAY_OR, warning.id)
            assertContains(warning.detail, "day 1")
            assertContains(warning.detail, "MON")
        }

        @Test
        fun `stays quiet when only one day field is restricted`() {
            assertFalse(ids("0 0 1 * *").contains(WarningId.DAY_OR))
            assertFalse(ids("0 0 * * 1").contains(WarningId.DAY_OR))
        }
    }

    @Nested
    @DisplayName("short months")
    inner class ShortMonths {

        @Test
        fun `flags a 31st, naming the months that lack one`() {
            val warning = lint("0 0 31 * *").first()
            assertEquals(WarningId.SHORT_MONTH, warning.id)
            assertContains(warning.detail, "February")
            assertContains(warning.detail, "April")
            assertContains(warning.detail, "November")
            assertFalse(warning.detail.contains("January"))
        }

        @Test
        fun `flags a 30th only for February`() {
            val warning = lint("0 0 30 * *").find { it.id == WarningId.SHORT_MONTH }
            assertNotNull(warning)
            assertContains(warning!!.detail, "February")
            assertFalse(warning.detail.contains("April"))
        }

        @Test
        fun `treats a 29th as the leap-year case it is`() {
            val warning = lint("0 0 29 * *").find { it.id == WarningId.SHORT_MONTH }
            assertNotNull(warning)
            assertContains(warning!!.title, "leap year")
        }

        @Test
        fun `stays quiet when every selected month has that day`() {
            assertFalse(ids("0 0 31 1,3,5 *").contains(WarningId.SHORT_MONTH))
            assertFalse(ids("0 0 29 1 *").contains(WarningId.SHORT_MONTH))
        }

        @Test
        fun `stays quiet when another day in the list still lands in the short month`() {
            // `15,31` runs in February on the 15th, so February is not skipped.
            assertFalse(ids("0 0 15,31 * *").contains(WarningId.SHORT_MONTH))
        }

        @Test
        fun `stays quiet for a wildcard day, which always includes the 1st`() {
            assertFalse(ids("0 0 * * *").contains(WarningId.SHORT_MONTH))
            assertFalse(ids("*/15 9-17 * * 1-5").contains(WarningId.SHORT_MONTH))
        }
    }

    @Nested
    @DisplayName("on the hour")
    inner class OnTheHour {

        @Test
        fun `flags minute 0 of every hour`() {
            assertTrue(ids("0 * * * *").contains(WarningId.ON_THE_HOUR))
        }

        @Test
        fun `leaves ordinary daily schedules alone`() {
            assertFalse(ids("0 3 * * *").contains(WarningId.ON_THE_HOUR))
            assertFalse(ids("0 0 * * *").contains(WarningId.ON_THE_HOUR))
        }
    }

    @Nested
    @DisplayName("across dialects")
    inner class AcrossDialects {

        @Test
        fun `reads the right fields in the seconds dialect, where every field shifts along one`() {
            // `*/7` is in the *seconds* field here, not the minute field.
            val warning = lint("*/7 * * * * *", Dialect.SECONDS).first()
            assertEquals(WarningId.UNEVEN_STEP, warning.id)
            assertContains(warning.title, "second")
            assertContains(warning.detail, "4 seconds")
        }

        @Test
        fun `does not mistake the seconds field for the minute field`() {
            // Minute is the second field here and divides evenly, so nothing should fire.
            assertEquals(emptyList<WarningId>(), ids("0 */15 * * * *", Dialect.SECONDS))
        }

        @Test
        fun `still catches the day OR under EventBridge numbering`() {
            assertTrue(ids("0 0 1 * 2 *", Dialect.EVENTBRIDGE).contains(WarningId.DAY_OR))
        }

        @Test
        fun `ignores a step in the EventBridge year, which has no cycle to wrap`() {
            assertFalse(
                ids("0 12 1 1 ? 2020-2030/5", Dialect.EVENTBRIDGE)
                    .contains(WarningId.UNEVEN_STEP),
            )
        }
    }
}
