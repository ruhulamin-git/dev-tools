package com.devxhub.cronexplainer

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.ui.Messages

/**
 * A placeholder action, present only to prove the plugin is registered, loaded
 * and reachable from the UI. Stage 2 replaces it with an Annotator, which is
 * where the real work happens - a menu item is the wrong shape for this tool.
 */
class ExplainCronAction : AnAction() {
    override fun actionPerformed(event: AnActionEvent) {
        Messages.showInfoMessage(
            event.project,
            "The plugin is loaded and the action is wired up.\n\n" +
                "Next: the cron engine, then the annotator that puts this " +
                "inline where schedules are written.",
            "Cron Expression Explainer",
        )
    }
}
