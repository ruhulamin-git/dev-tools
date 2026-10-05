# Terraform. Two different crons live in this one file type, which is the point.
#
# Requires the "Terraform and HCL" plugin. It is not bundled with IDEA Community, so if these
# lines are plain text with no annotations, that is the reason - install it from the Marketplace.

# OK - "At 03:00 AM". EventBridge: six fields ending in a year, wrapped in cron(...).
resource "aws_cloudwatch_event_rule" "nightly" {
  name                = "nightly-report"
  schedule_expression = "cron(0 3 * * ? *)"
}

# OK - "At 06:00 PM, Monday through Friday". The one that catches people out: EventBridge
# numbers Sunday as 1, so 2-6 is Mon-Fri here and Tue-Sat in a workflow file.
resource "aws_cloudwatch_event_rule" "weekday_close" {
  name                = "weekday-close"
  schedule_expression = "cron(0 18 ? * 2-6 *)"
}

# OK - "At 12:00 PM, on day 1 of the month, only in 2027". A year field is EventBridge only.
resource "aws_cloudwatch_event_rule" "one_off" {
  name                = "new-year-2027"
  schedule_expression = "cron(0 12 1 1 ? 2027)"
}

# ERROR on the hour field only - the squiggle should cover `25`, inside the parentheses
resource "aws_cloudwatch_event_rule" "broken" {
  name                = "broken"
  schedule_expression = "cron(0 25 * * ? *)"
}

# ERROR - five fields. EventBridge always wants six.
resource "aws_cloudwatch_event_rule" "too_few" {
  name                = "too-few"
  schedule_expression = "cron(0 3 * * *)"
}

# Silent - rate() is a schedule, but it is not cron, and reporting it as broken would be wrong
resource "aws_cloudwatch_event_rule" "rated" {
  name                = "every-five"
  schedule_expression = "rate(5 minutes)"
}

# OK - "At 03:00 AM". Plain Unix cron, unwrapped, in the same file as the EventBridge ones
# above. Same five characters, a different language, and the plugin reads each in its own.
resource "aws_autoscaling_schedule" "scale_up" {
  scheduled_action_name  = "scale-up"
  autoscaling_group_name = "web"
  recurrence             = "0 3 * * *"
  min_size               = 2
  max_size               = 10
  desired_capacity       = 4
}

# WARNING (day OR) - the 1st AND every Monday. Unix dialect, so 1 is Monday here.
resource "aws_autoscaling_schedule" "billing" {
  scheduled_action_name  = "billing"
  autoscaling_group_name = "web"
  recurrence             = "0 0 1 * 1"
  min_size               = 1
  max_size               = 4
  desired_capacity       = 1
}
