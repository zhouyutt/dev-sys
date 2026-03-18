# Dive ERP MiniApp PRD v1

## 1. Background

The current Dive ERP web system already supports guest, room, trip, staff, and dashboard workflows.  
To improve mobile operations and owner visibility, v1 introduces a WeChat Mini Program for:

- Guest self-service
- Staff operations
- Owner read-only dashboard

## 2. Goals

- Launch in 4-6 weeks with high-frequency workflows only.
- Reuse existing backend APIs and RBAC model.
- Avoid 1:1 migration of all web pages in v1.

## 3. User Roles

- **Guest**: manages own profile, views own trips and room info, reads notifications.
- **Staff**: processes daily tasks, updates guest status, checks guests in/out, marks trip sign-in.
- **Owner**: views KPIs and operational summaries.

## 4. Scope (v1)

### 4.1 Guest Side

- My Profile (view + partial edit)
- My Trips (upcoming/history)
- My Room (current room + stay period)
- Notifications (trip reminders + operational notices)

### 4.2 Staff Side

- Today board (today trips, pending guests, room status summary)
- Guest status update
- Room check-in/check-out
- Trip sign-in

### 4.3 Owner Side

- Daily trips count
- Guest flow summary
- Room occupancy rate
- Destination/course distribution snapshot

## 5. Out of Scope (v1)

- WeChat payment
- Full reporting drill-down
- Bulk offline sync and complex approvals

## 6. Core Flows

### 6.1 First Login and Binding

1. User opens miniapp and grants login.
2. Miniapp sends `code` to backend.
3. Backend verifies via WeChat OpenAPI and returns `openid`.
4. User binds ERP account (username/password + role type + profile id).
5. Backend stores binding and returns access token.

### 6.2 Guest Trip View

1. Guest enters "My Trips".
2. Backend returns trip list linked by student id.
3. Guest sees trip details and sign-in status.

### 6.3 Staff Daily Operations

1. Staff opens "Today Board".
2. Backend returns pending tasks and summary.
3. Staff performs status updates.
4. Backend records audit logs for updates.

## 7. Data and Permission Rules

- All permission checks are backend enforced.
- Frontend route visibility is role-based convenience only.
- Write operations must include operator identity and source `miniapp`.

## 8. Acceptance Criteria

- P0 bugs: 0
- Core API success rate >= 99%
- Key API P95 response < 500ms (read APIs may use cache)
- Complete UAT scripts for guest/staff/owner roles

