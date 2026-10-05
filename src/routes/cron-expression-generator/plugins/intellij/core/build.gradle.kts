// The cron engine: pure Kotlin, no IntelliJ dependency of any kind.
//
// Kept out of the plugin project on purpose. The IntelliJ Platform plugin rewires the `test`
// task to run under the IDE's own classloader, which is right for tests that need a real IDE
// and pure overhead for tests that do not. Here the tests are plain JUnit 5 and run in
// milliseconds, which is what makes a red/green loop over ~130 cases bearable.
//
// It also keeps the engine portable: nothing here knows what an IDE is, so the same code could
// back a CLI or a language server later.

plugins {
    alias(libs.plugins.kotlin)
}

group = "com.devxhub"
version = rootProject.version

repositories {
    mavenCentral()
}

/**
 * Both cron libraries drag in slf4j, at two different versions, and the IDE already provides it -
 * a second copy of a logging facade on the plugin classpath is a class-loading conflict waiting
 * to happen. It has to come off both: excluding it from one just lets the other's version win.
 */
fun ExternalModuleDependency.excludeSlf4j() =
    exclude(group = "org.slf4j", module = "slf4j-api")

dependencies {
    api(libs.cron.utils) { excludeSlf4j() }
    api(libs.cron.descriptor) {
        excludeSlf4j()

        // joda-time (2013) and commons-lang3 3.3.2 (2014) stay, unwelcome as they are: both
        // were tried as exclusions and both broke the suite - joda-time is what
        // cron-parser-core formats descriptions with, and cron-utils parses through
        // commons-lang3. Neither failed loudly, either. The expressions simply came back
        // "invalid", which is the argument for having ported the TypeScript assertions rather
        // than trusting the verifier: it resolves references, and these were reachable.
    }

    // `kotlin.stdlib.default.dependency=false` in gradle.properties is set for the plugin
    // project, where bundling a second stdlib alongside the IDE's own breaks class loading.
    // It applies to every subproject though, so this module has to ask for the stdlib back:
    // compileOnly, because at runtime inside the IDE the platform still supplies it, and
    // shipping a copy would resurrect exactly the conflict that setting exists to prevent.
    compileOnly(kotlin("stdlib"))

    testImplementation(kotlin("stdlib"))
    // cron-utils logs through slf4j, so the API has to be on the classpath somewhere. Inside
    // the IDE the platform supplies it; here there is no platform, so the tests ask for it back
    // - the same shape as the stdlib above, and for the same reason.
    testImplementation(libs.slf4j.api)
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly(libs.junit.launcher)
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("failed")
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
