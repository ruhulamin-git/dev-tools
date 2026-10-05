// Spring @Scheduled. Open in the sandbox IDE; the expected result is above each expression.
//
// Nothing here needs Spring on the classpath - the annotator matches @Scheduled by its simple
// name, so an unresolved annotation still gets read.
package samples;

import org.springframework.scheduling.annotation.Scheduled;

public class ScheduledTasks {

    // OK - "At 12:00 AM". Six fields, seconds first: the same text is a hard error in a
    // workflow file, and the plugin reads it correctly in both places.
    @Scheduled(cron = "0 0 0 * * ?")
    public void midnight() {}

    // OK - "Every 30 seconds"
    @Scheduled(cron = "*/30 * * * * *")
    public void heartbeat() {}

    // OK - "At 09:15 AM, Monday through Friday"
    @Scheduled(cron = "0 15 9 * * MON-FRI")
    public void weekdayOpen() {}

    // WARNING (day OR) - the 1st AND every Monday, not only Mondays that are the 1st
    @Scheduled(cron = "0 0 0 1 * MON")
    public void billing() {}

    // WARNING (uneven step) - 0, 7 ... 56, then 0 again, a 4-minute gap across the hour
    @Scheduled(cron = "0 */7 * * * *")
    public void uneven() {}

    // ERROR on the seconds field only - the squiggle should cover `60`, not the whole string
    @Scheduled(cron = "60 0 0 * * *")
    public void badSecond() {}

    // ERROR - five fields is Unix cron; @Scheduled always wants six
    @Scheduled(cron = "0 0 * * *")
    public void tooFewFields() {}

    // Silent - a property placeholder is not an expression to explain
    @Scheduled(cron = "${report.schedule}")
    public void externalised() {}

    // Silent - fixedDelay is milliseconds, and the annotator must not touch other attributes
    @Scheduled(fixedDelayString = "0 0 0 * * ?")
    public void notACronAttribute() {}
}
