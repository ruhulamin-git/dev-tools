package com.devxhub.cronexplainer.core

/**
 * The expressions people actually write, offered as completions.
 *
 * Deliberately per-dialect rather than one list with the fields shuffled. A five-field schedule
 * is not a six-field one with a zero glued on the front: EventBridge needs a `?` in exactly one
 * of the two day fields and a year on the end, and Spring counts seconds first. Offering the
 * wrong shape would teach the wrong syntax, which is worse than offering nothing.
 *
 * No descriptions here. Every one of these is run through [parseCron] when it is shown, so the
 * completion popup and the hover can never disagree about what an expression means, and a fix to
 * the describer reaches both at once.
 */
fun presets(dialect: Dialect): List<String> = when (dialect) {
    Dialect.UNIX -> UNIX_PRESETS
    Dialect.SECONDS -> SECONDS_PRESETS
    Dialect.EVENTBRIDGE -> EVENTBRIDGE_PRESETS
}

private val UNIX_PRESETS = listOf(
    "* * * * *",
    "*/5 * * * *",
    "*/10 * * * *",
    "*/15 * * * *",
    "*/30 * * * *",
    "0 * * * *",
    "0 */2 * * *",
    "0 */6 * * *",
    "0 0 * * *",
    "0 3 * * *",
    "0 9 * * *",
    "0 12 * * *",
    "0 9 * * 1-5",
    "0 18 * * 1-5",
    "0 0 * * 0",
    "0 0 * * 1",
    "0 0 * * 6,0",
    "0 0 1 * *",
    "0 0 1,15 * *",
    "0 0 1 1 *",
    "30 2 * * 6",
    "@hourly",
    "@daily",
    "@weekly",
    "@monthly",
    "@yearly",
)

private val SECONDS_PRESETS = listOf(
    "* * * * * *",
    "*/10 * * * * *",
    "*/30 * * * * *",
    "0 * * * * *",
    "0 */5 * * * *",
    "0 */15 * * * *",
    "0 */30 * * * *",
    "0 0 * * * *",
    "0 0 */6 * * *",
    "0 0 0 * * *",
    "0 0 3 * * *",
    "0 0 9 * * *",
    "0 0 9 * * MON-FRI",
    "0 0 18 * * MON-FRI",
    "0 0 0 * * SUN",
    "0 0 0 * * MON",
    "0 0 0 1 * *",
    "0 0 0 1 1 *",
    "0 30 2 * * SAT",
)

private val EVENTBRIDGE_PRESETS = listOf(
    "*/5 * * * ? *",
    "*/15 * * * ? *",
    "0 * * * ? *",
    "0 */6 * * ? *",
    "0 0 * * ? *",
    "0 3 * * ? *",
    "0 12 * * ? *",
    "0 9 ? * 2-6 *",
    "0 18 ? * 2-6 *",
    "0 0 ? * 1 *",
    "0 0 ? * 2 *",
    "0 0 1 * ? *",
    "0 0 1 1 ? *",
    "0 0 L * ? *",
)
