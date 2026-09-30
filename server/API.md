# Medical Scheduler — REST API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

Error envelope (all errors):
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

---

## Auth  `/api/auth`

### POST /auth/register
Register a new patient account.

**Request**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret123!",
  "phone": "+1-555-0100"
}
```
**Response 201**
```json
{
  "user": { "id": "uuid", "full_name": "Jane Doe", "email": "jane@example.com", "role": "patient" },
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```
**Errors**: 400 validation, 409 email taken

---

### POST /auth/login
```json
{ "email": "jane@example.com", "password": "Secret123!" }
```
**Response 200**
```json
{
  "user": { "id": "uuid", "full_name": "Jane Doe", "role": "patient" },
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```
**Errors**: 400 validation, 401 invalid credentials, 403 account inactive

---

### POST /auth/refresh
Exchange a refresh token for a new access token.
```json
{ "refresh_token": "<jwt>" }
```
**Response 200**
```json
{ "access_token": "<new_jwt>" }
```

---

### POST /auth/logout
🔒 Authenticated. Invalidates the refresh token server-side.
```json
{ "refresh_token": "<jwt>" }
```
**Response 204** No content

---

### GET /auth/me
🔒 Authenticated. Returns the current user's profile.

**Response 200**
```json
{
  "id": "uuid", "full_name": "Jane Doe",
  "email": "jane@example.com", "role": "patient", "phone": "+1-555-0100"
}
```

---

## Doctors  `/api/doctors`

### GET /doctors
Search/list doctors. Public endpoint.

**Query params**
| Param | Type | Description |
|---|---|---|
| `search` | string | Name or specialty keyword (ILIKE) |
| `specialty_id` | int | Filter by specialty |
| `page` | int | Default 1 |
| `limit` | int | Default 20, max 50 |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Dr. Smith",
      "specialty": "Cardiology",
      "bio": "...",
      "consultation_fee": 150.00,
      "years_experience": 12,
      "avg_rating": 4.7,
      "is_available": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### GET /doctors/:id
Get a single doctor's full profile.

**Response 200**
```json
{
  "id": "uuid",
  "full_name": "Dr. Smith",
  "specialty": { "id": 2, "name": "Cardiology" },
  "bio": "...",
  "consultation_fee": 150.00,
  "years_experience": 12,
  "avg_rating": 4.7,
  "availability": [
    { "day_of_week": 1, "start_time": "09:00", "end_time": "17:00" },
    { "day_of_week": 3, "start_time": "09:00", "end_time": "13:00" }
  ]
}
```

---

### GET /doctors/:id/slots
Get available (unbooked) 30-min slots for a doctor on a given date.

**Query params**: `date` (YYYY-MM-DD, required)

**Response 200**
```json
{
  "date": "2025-08-10",
  "doctor_id": "uuid",
  "slots": [
    { "start": "2025-08-10T09:00:00Z", "end": "2025-08-10T09:30:00Z" },
    { "start": "2025-08-10T09:30:00Z", "end": "2025-08-10T10:00:00Z" }
  ]
}
```
**Errors**: 400 date in past, 404 doctor not found, 200 `slots: []` on leave day

---

## Availability  `/api/availability`  🔒 Doctor only

### GET /availability
Returns the current doctor's weekly availability.

**Response 200**
```json
{
  "availability": [
    { "id": 1, "day_of_week": 1, "start_time": "09:00", "end_time": "17:00", "is_active": true }
  ]
}
```

---

### PUT /availability
Replace the current doctor's full weekly availability.

**Request**
```json
{
  "availability": [
    { "day_of_week": 1, "start_time": "09:00", "end_time": "17:00" },
    { "day_of_week": 3, "start_time": "09:00", "end_time": "13:00" }
  ]
}
```
**Response 200** — returns updated availability array

---

### GET /availability/leaves
List all leave blocks for the current doctor.

**Response 200**
```json
{
  "leaves": [
    { "id": 5, "block_date": "2025-08-15", "reason": "Conference" }
  ]
}
```

---

### POST /availability/leaves
Add a leave day.
```json
{ "block_date": "2025-08-15", "reason": "Conference" }
```
**Response 201**
```json
{ "id": 5, "block_date": "2025-08-15", "reason": "Conference" }
```
**Errors**: 409 date already blocked, 400 date in past

---

### DELETE /availability/leaves/:id
Remove a leave block.
**Response 204** No content

---

## Appointments  `/api/appointments`

### POST /appointments  🔒 Patient only
Book an appointment.

**Request**
```json
{
  "doctor_id": "uuid",
  "slot_start": "2025-08-10T09:00:00Z",
  "reason": "Chest pain follow-up"
}
```
**Response 201**
```json
{
  "id": "uuid",
  "doctor": { "id": "uuid", "full_name": "Dr. Smith", "specialty": "Cardiology" },
  "slot_start": "2025-08-10T09:00:00Z",
  "slot_end":   "2025-08-10T09:30:00Z",
  "status": "pending",
  "reason": "Chest pain follow-up",
  "booked_at": "2025-08-01T14:22:00Z"
}
```
**Errors**: 400 slot in past / invalid, 409 slot already taken, 422 outside availability

---

### GET /appointments  🔒 Patient | Doctor | Admin
Returns appointments scoped to the caller's role.

**Query params**
| Param | Description |
|---|---|
| `status` | Filter by status |
| `from` | ISO date range start |
| `to` | ISO date range end |
| `page` / `limit` | Pagination |

Patient → own appointments.
Doctor → own schedule.
Admin → all (add `doctor_id` / `patient_id` filter params).

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "patient": { "id": "uuid", "full_name": "Jane Doe" },
      "doctor":  { "id": "uuid", "full_name": "Dr. Smith" },
      "slot_start": "2025-08-10T09:00:00Z",
      "slot_end":   "2025-08-10T09:30:00Z",
      "status": "confirmed",
      "reason": "Chest pain follow-up"
    }
  ],
  "total": 5, "page": 1, "limit": 20
}
```

---

### GET /appointments/:id  🔒 Owner (patient/doctor) | Admin

**Response 200** — full appointment object (same shape as above + `doctor_notes`, `cancel_reason`)

---

### PATCH /appointments/:id  🔒 Varies by field

Update appointment status or notes.

**Patient** may send: `{ "status": "cancelled", "cancel_reason": "..." }`  
(Rejected if < 24 h before slot_start.)

**Doctor** may send: `{ "status": "confirmed" | "completed" | "no_show", "doctor_notes": "..." }`

**Admin** may send any status transition.

**Request** (patient cancellation)
```json
{ "status": "cancelled", "cancel_reason": "Feeling better" }
```
**Response 200** — updated appointment object

**Errors**: 400 invalid transition, 422 cancellation window expired, 403 wrong role

---

### PATCH /appointments/:id/reschedule  🔒 Patient only
Reschedule to a new slot (cancels old, books new atomically).

**Request**
```json
{ "slot_start": "2025-08-11T10:00:00Z" }
```
**Response 200** — updated appointment with new slot

---

## Specialties  `/api/specialties`

### GET /specialties
Public. Returns all specialties.
```json
{ "data": [{ "id": 1, "name": "General Practice" }, ...] }
```

---

## Admin  `/api/admin`  🔒 Admin only

### GET /admin/users
List all users.

**Query**: `role`, `search`, `page`, `limit`

**Response 200** — paginated user list (no password_hash)

---

### PATCH /admin/users/:id
Activate or deactivate a user account.
```json
{ "is_active": false }
```
**Response 200** — updated user object

---

### POST /admin/doctors
Create a doctor profile for an existing user.
```json
{
  "user_id": "uuid",
  "specialty_id": 2,
  "bio": "Board-certified cardiologist.",
  "consultation_fee": 150.00,
  "years_experience": 12
}
```
**Response 201** — new doctor object

---

### GET /admin/appointments
All appointments with full filters (`doctor_id`, `patient_id`, `status`, `from`, `to`).

**Response 200** — paginated appointment list

---

### GET /admin/reports/summary
High-level stats.

**Response 200**
```json
{
  "total_appointments": 342,
  "by_status": {
    "pending": 12, "confirmed": 87, "completed": 210,
    "cancelled": 28, "no_show": 5
  },
  "total_doctors": 18,
  "total_patients": 156,
  "appointments_this_week": 34
}
```

---

## HTTP Status Code Guide

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role or ownership) |
| 404 | Not Found |
| 409 | Conflict (duplicate booking, email taken) |
| 422 | Unprocessable (business rule violation) |
| 500 | Internal Server Error |
