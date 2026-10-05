import org.jetbrains.changelog.Changelog

plugins {
    alias(libs.plugins.kotlin)
    alias(libs.plugins.intellijPlatform)
    alias(libs.plugins.changelog)
}

group = "com.devxhub"
version = "0.1.1"

repositories {
    mavenCentral()
    // Adds JetBrains' own repositories, where the IDE distributions and the
    // plugin verifier live. Contributed by the intellijPlatform plugin.
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        // The IDE this plugin is compiled and tested against. "IC" is IDEA
        // Community; the version matches the IDE installed on this machine.
        // Gradle downloads it once into ~/.gradle and caches it thereafter.
        create("IC", "2025.2.3")

        // YAML is where cron actually lives now - GitHub Actions workflows and Kubernetes
        // CronJobs. Bundled in every IDE this plugin targets, but declared as an optional
        // dependency in plugin.xml so the plugin still loads if an IDE ever lacks it.
        bundledPlugin("org.jetbrains.plugins.yaml")

        // Java, for Spring's @Scheduled. Compiled against, but optional at runtime: the
        // annotator that uses it is registered in cron-java.xml, so IDEs without Java simply
        // never load it.
        bundledPlugin("com.intellij.java")

        // Kotlin, for @Scheduled in Kotlin sources. Optional at runtime in the same way - the
        // annotator lives in cron-kotlin.xml.
        bundledPlugin("org.jetbrains.kotlin")

        // Terraform, for AWS EventBridge schedules. Not bundled in any IDE this builds against -
        // it comes from the Marketplace - so the version is pinned to the 252 branch by hand.
        plugin("org.intellij.plugins.hcl", "252.26199.7")
    }

    // The engine, plus cron-utils riding along via its `api` dependency. Both get
    // bundled into the distribution - the IDE ships no cron library of its own.
    implementation(project(":core"))
}

kotlin {
    // The platform has required Java 21 since 2024.2. Compiling to anything
    // higher produces class files the IDE refuses to load.
    jvmToolchain(21)
}

intellijPlatform {
    pluginConfiguration {
        version = project.version.toString()

        // The Marketplace listing and the IDE's plugin manager both read this. Rendering it
        // from CHANGELOG.md rather than writing it into plugin.xml means there is one place to
        // edit, and that a release cannot ship notes that disagree with the changelog.
        changeNotes = provider {
            with(changelog) {
                renderItem(
                    (getOrNull(project.version.toString()) ?: getUnreleased())
                        .withHeader(false)
                        .withEmptySections(false),
                    Changelog.OutputType.HTML,
                )
            }
        }

        ideaVersion {
            // 252 is the 2025.2 branch. Anything older refuses to install.
            sinceBuild = "252"
            // Left open so 2025.3+ can install it without a rebuild. The
            // plugin verifier (stage 4) is what proves that claim is honest.
            untilBuild = provider { null }
        }
    }

    // Runs JetBrains' compatibility checker against real IDE builds.
    pluginVerification {
        ides {
            recommended()
        }
    }
}

tasks.test {
    useJUnitPlatform()
}

changelog {
    version = project.version.toString()
    // The changelog already groups changes under its own headings; the plugin's default
    // Added/Changed/Fixed scaffolding would only add empty sections to every release.
    groups.empty()
}
