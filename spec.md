# Intelligent Parent Eye (IPE)

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Dashboard**: Overview of monitored children's devices with status indicators
- **Child Profile Management**: Add/edit/remove child profiles (name, age, device info)
- **Screen Time Monitoring**: Set daily screen time limits per child; view usage stats
- **App & Content Controls**: Block/allow specific app categories; safe browsing toggle
- **Activity Feed**: Timeline of recent alerts and activity events per child
- **Alerts & Notifications**: In-app alerts when limits are exceeded or blocked content accessed
- **Admin Login**: Parent account with secure login to access all controls
- **Settings**: Parent profile, notification preferences, emergency contacts

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Authorization with parent/admin role
   - Child profile CRUD (name, age, device name, avatar color)
   - Screen time rules: daily limit per child, current usage tracking
   - App category rules: array of blocked categories per child
   - Activity log: timestamped events (app opened, limit reached, blocked attempt)
   - Alert records: unread alerts per child

2. Frontend (React):
   - Login/auth flow (parent login)
   - Dashboard: list of children cards with current usage vs limit, alert badge
   - Child detail page: screen time chart, app controls, activity feed
   - Add/edit child modal
   - Settings page
   - Responsive mobile-first layout (smartphone-focused)
