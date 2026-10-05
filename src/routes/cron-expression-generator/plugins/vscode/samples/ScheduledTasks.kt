// Spring @Scheduled in Kotlin. Same annotation, different PSI - a Kotlin string is a template
// built from entries rather than a literal, which is why this needs its own recogniser.
package samples

import org.springframework.scheduling.annotation.Scheduled

class ScheduledTasks {

    // OK - "At 12:00 AM". Six fields, seconds first: the same text is a hard error in a
    // workflow file, and the plugin reads it correctly in both places.
    @Scheduled(cron = "0 0 0 * * ?")
    fun midnight() {}

    // OK - "Every 30 seconds"
    @Scheduled(cron = "*/30 * * * * *")
    fun heartbeat() {}

    // WARNING (day OR) - the 1st AND every Monday, not only Mondays that are the 1st
    @Scheduled(cron = "0 0 0 1 * MON")
    fun billing() {}

    // ERROR on the seconds field only - the squiggle should cover `60`
    @Scheduled(cron = "60 0 0 * * *")
    fun badSecond() {}

    // ERROR - five fields is Unix cron; @Scheduled always wants six
    @Scheduled(cron = "0 0 * * *")
    fun tooFewFields() {}

    // Silent - an escaped placeholder is not an expression to explain
    @Scheduled(cron = "\${report.schedule}")
    fun externalised() {}

    // Silent - a template with an interpolation is not knowable without running the program
    @Scheduled(cron = "0 0 $HOUR * * *")
    fun interpolated() {}

    // Silent - fixedDelayString is milliseconds, not a schedule
    @Scheduled(fixedDelayString = "0 0 0 * * ?")
    fun notACronAttribute() {}

    private companion object {
        const val HOUR = "3"
    }
}
