# API Documentation

## Base URL
```
http://localhost:3008/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/login
Login to get authentication token.

**Request:**
```json
{
  "email": "dsp@careservice.com",
  "password": "dsp123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "dsp@careservice.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "dsp"
  }
}
```

### POST /auth/register
Create a new user account (admin only).

**Request:**
```json
{
  "email": "newuser@careservice.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "dsp",
  "phone": "555-0199"
}
```

## Clients

### GET /clients
Get all clients with optional filters.

**Query Parameters:**
- `search` - Search by name or DDD ID
- `isActive` - Filter by active status (true/false)

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "dateOfBirth": "1995-03-15",
    "dddId": "DDD-2024-001",
    "address": "123 Main St",
    "emergencyContactName": "Mary Johnson",
    "emergencyContactPhone": "555-0100",
    "isActive": true,
    "ispOutcomes": [...],
    "_count": {
      "serviceSessions": 10,
      "progressNotes": 5
    }
  }
]
```

### GET /clients/:id
Get a specific client by ID.

### POST /clients
Create a new client (manager/admin only).

**Request:**
```json
{
  "firstName": "Michael",
  "lastName": "Smith",
  "dateOfBirth": "1990-05-20",
  "dddId": "DDD-2024-003",
  "address": "789 Oak St",
  "emergencyContactName": "Lisa Smith",
  "emergencyContactPhone": "555-0200"
}
```

### PUT /clients/:id
Update a client (manager/admin only).

### DELETE /clients/:id
Delete a client (admin only).

## Service Sessions

### POST /sessions/clock-in
Clock in to start a service session (DSP/admin only).

**Request:**
```json
{
  "clientId": "uuid",
  "serviceType": "community_based_support",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "locationName": "Community Center"
}
```

**Response:**
```json
{
  "id": "uuid",
  "staffId": "uuid",
  "clientId": "uuid",
  "serviceType": "community_based_support",
  "clockInTime": "2024-01-25T14:30:00Z",
  "clockInLat": 40.7128,
  "clockInLng": -74.0060,
  "locationName": "Community Center",
  "status": "in_progress",
  "client": {
    "id": "uuid",
    "firstName": "Sarah",
    "lastName": "Johnson"
  }
}
```

### POST /sessions/clock-out
Clock out to end a service session (DSP/admin only).

**Request:**
```json
{
  "sessionId": "uuid",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "id": "uuid",
  "clockOutTime": "2024-01-25T16:30:00Z",
  "totalHours": 2.0,
  "status": "completed",
  ...
}
```

### GET /sessions/active
Get current user's active sessions.

### GET /sessions/history
Get current user's session history.

**Query Parameters:**
- `limit` - Number of sessions to return (default: 20)

### GET /sessions/all
Get all sessions with filters (manager/admin only).

**Query Parameters:**
- `staffId` - Filter by staff member
- `clientId` - Filter by client
- `status` - Filter by status
- `startDate` - Filter by start date
- `endDate` - Filter by end date

## Service Types

Valid service types:
- `community_based_support`
- `individual_support`
- `respite`
- `behavioral_support`
- `vocational_support`

## User Roles

- `dsp` - Direct Support Professional (field staff)
- `manager` - Manager/Supervisor (approves notes)
- `admin` - Administrator (full access)

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
