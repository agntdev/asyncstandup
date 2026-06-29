# AsyncStandup Bot — Bot specification

**Archetype:** workflow

**Voice:** professional and concise — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot that facilitates asynchronous daily standups for distributed teams. It sends standup questions to each member at their local scheduled time, collects responses, sends one reminder to non-responders, and posts a polished digest to the team channel after all responses arrive or a cutoff is reached. The digest highlights blockers and lists non-responders, with a searchable history of past standups for tracking recurring issues.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Team leads and managers
- Team members

## Success criteria

- Daily standup digests are posted to the team channel on schedule
- Members receive standup questions at their local scheduled time
- Digests include all responses and highlight blockers
- History of past standups is searchable and accessible

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu for the bot
- **/help** (command, actor: user, command: /help) — Access help and instructions for using the bot
- **Create Team** (button, actor: admin, callback: create_team) — Create a new team and connect it to a channel for standup digests
- **Add Member** (button, actor: admin, callback: add_member) — Add a new team member by Telegram username
- **Configure Schedule** (button, actor: admin, callback: configure_schedule) — Set the daily standup schedule including time, days, and cutoff
- **Edit Questions** (button, actor: admin, callback: edit_questions) — Customize the standup questions or use the default set
- **View History** (button, actor: user, callback: view_history) — Access past standup records and filter by date or blockers
- **Skip Today** (button, actor: user, callback: skip_today) — Skip the current day's standup and mark as unavailable
- **Mark Off** (button, actor: user, callback: mark_off) — Mark yourself as unavailable for the current standup

## Flows

### Create Team
_Trigger:_ /create_team

1. Admin initiates team creation
2. Enter team name
3. Select or link to a team channel for digests

_Data touched:_ Team

### Add Member
_Trigger:_ /add_member

1. Admin initiates member addition
2. Enter Telegram username
3. Set timezone (auto-detected with option to edit)

_Data touched:_ Member

### Configure Schedule
_Trigger:_ /configure_schedule

1. Admin selects schedule configuration
2. Set local delivery time
3. Select weekdays to run
4. Set cutoff time
5. Set one-reminder delay

_Data touched:_ Schedule

### Edit Questions
_Trigger:_ /edit_questions

1. Admin selects question editing
2. Choose to use default questions or customize
3. If custom, enter free-text list of questions

_Data touched:_ Standup template

### Daily Standup Run
_Trigger:_ scheduled event

1. At scheduled time, bot DMs each member the questions
2. Member answers, skips, or marks off
3. Bot confirms receipt of answers
4. If no response within reminder delay, send one reminder

_Data touched:_ Standup run, Member

### Digest and Posting
_Trigger:_ standup run completion or cutoff

1. Compile all responses
2. Format digest with answers, blockers, and pending members
3. Post digest to team channel

_Data touched:_ Digest, Standup run

### History & Lookup
_Trigger:_ /view_history

1. User requests history
2. Select date range or filter by blockers
3. Display filtered history records

_Data touched:_ History record

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **Team** _(retention: persistent)_ — A group of members linked to a team channel for standup digests
  - fields: team_id, name, channel_id, admin_id
- **Member** _(retention: persistent)_ — A Telegram user with timezone, opt-in status, and DND settings
  - fields: member_id, telegram_id, name, timezone, opt_in, dnd_opt_out
- **Standup template** _(retention: persistent)_ — Set of questions for standup prompts
  - fields: template_id, team_id, questions
- **Schedule** _(retention: persistent)_ — Configuration for daily standup timing and cutoff
  - fields: schedule_id, team_id, local_time, days_of_week, cutoff_time, reminder_delay
- **Standup run** _(retention: persistent)_ — Single occurrence of a standup with member responses and status
  - fields: run_id, team_id, run_date, run_time, member_status, answers, reminder_flag, digest_posted
- **Digest** _(retention: persistent)_ — Final posted message for a standup run
  - fields: digest_id, run_id, content, timestamp
- **History record** _(retention: persistent)_ — Standup run metadata and answers for lookup and reporting
  - fields: history_id, run_id, team_id, run_date, run_time, member_answers, blockers, pending_members

## Integrations

- **Telegram** (required) — Bot API messaging for standup prompts, reminders, and digests
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Create and manage teams
- Add/remove members
- Configure schedules and questions
- Set data retention policies
- Receive admin notifications for critical failures

## Notifications

- Admin notifications for critical failures (e.g., bot removed from channel)
- Member notifications for standup prompts and reminders

## Permissions & privacy

- Members can opt-in/out of standups
- Members can set DND preferences
- Admins can manage team settings but cannot access private member responses
- Data retention is configurable by admin

## Edge cases

- Bot removed from team channel
- Member changes timezone
- Standup run cutoff occurs before all responses are collected
- Member skips or marks off multiple consecutive days
- Admin tries to configure invalid schedule times

## Required tests

- Verify daily standup prompts are sent at correct local times
- Test digest formatting with various response scenarios
- Validate cutoff behavior and digest posting
- Ensure history lookup filters work correctly
- Test admin notifications for critical failures

## Assumptions

- Default questions are used if not customized
- Timezones are auto-detected with manual override
- One reminder is sent per non-responding member
- Digest is posted only when all responses are collected or cutoff is reached
- History retention is set to 1 year by default
