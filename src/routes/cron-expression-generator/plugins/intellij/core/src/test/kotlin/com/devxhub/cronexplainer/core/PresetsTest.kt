package com.devxhub.cronexplainer.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/**
 * A preset that does not parse is worse than no preset: it teaches a syntax error, in the one
 * place a user is trusting the tool to know better than they do. So every one of them is run
 * through the engine here rather than eyeballed.
 */
class PresetsTest {

    @Nested
    inner class EveryPresetIsValid {

        @Test
        fun `unix presets parse and describe`() = assertAllValid(Dialect.UNIX)

        @Test
        fun `seconds presets parse and describe`() = assertAllValid(Dialect.SECONDS)

        @Test
        fun `eventbridge presets parse and describe`() = assertAllValid(Dialect.EVENTBRIDGE)

        private fun assertAllValid(dialect: Dialect) {
            val broken = presets(dialect)
                .map { it to parseCron(it, dialect) }
                .filter { (_, result) -> !result.valid || result.description.isNullOrBlank() }
                .map { (expression, result) -> "$expression -> ${result.error ?: "no description"}" }

            assertEquals(emptyList<String>(), broken, "invalid presets for $dialect")
        }
    }

    @Nested
    inner class Shape {

        @Test
        fun `no duplicates within a dialect`() {
            for (dialect in Dialect.entries) {
                val list = presets(dialect)
                assertEquals(list.size, list.toSet().size, "duplicate preset in $dialect")
            }
        }

        @Test
        fun `macros are offered only where the dialect has them`() {
            assertTrue(presets(Dialect.UNIX).any { it.startsWith("@") })
            for (dialect in listOf(Dialect.SECONDS, Dialect.EVENTBRIDGE)) {
                assertTrue(
                    presets(dialect).none { it.startsWith("@") },
                    "$dialect does not support macros",
                )
            }
        }

        @Test
        fun `eventbridge presets use a question mark in exactly one day field`() {
            for (expression in presets(Dialect.EVENTBRIDGE)) {
                val fields = expression.split(" ")
                assertEquals(
                    1,
                    listOf(fields[2], fields[4]).count { it == "?" },
                    "$expression must mark exactly one day field unspecified",
                )
            }
        }
    }
}
