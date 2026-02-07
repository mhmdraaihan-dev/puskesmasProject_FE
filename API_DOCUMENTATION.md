# API Documentation - Puskesmas Project

This document outlines the API endpoints available for the frontend team to integrate with the backend services.

## Base URL
All API endpoints are prefixed with `/api`.
Example: `http://localhost:3000/api`

## Authentication
The login endpoint returns a JWT `accessToken`. This token should be included in the `Authorization` header for protected routes (implementation pending).

---

## 1. User Management

### 1.1 Create User (Register)
Creates a new user in the system.

- **URL**: `/api/user`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | String | Yes | Full name of the user. |
| `password` | String | Yes | User's password. |
| `email` | String | Yes | Unique email address. |
| `address` | String | Yes | User's address. |
| `position_user` | Enum | Yes | One of: `bidan_praktik`, `bidan_desa`, `bidan_koordinator` |
| `role` | Enum | No | default: `USER`. Options: `ADMIN`, `USER` |
| `status_user` | Enum | No | default: `INACTIVE`. Options: `ACTIVE`, `INACTIVE` |
| `phone_number` | String | No | User's phone number. |

**Example Request:**
```json
{
  "full_name": "Siti Aminah",
  "password": "securepassword123",
  "email": "siti.aminah@example.com",
  "address": "Jl. Mawar No. 10",
  "position_user": "bidan_desa",
  "phone_number": "081234567890"
}
```

#### Response (201 Created)
Returns the created user object (excluding the password).

```json
{
  "user_id": "uuid-string",
  "full_name": "Siti Aminah",
  "email": "siti.aminah@example.com",
  "address": "Jl. Mawar No. 10",
  "position_user": "bidan_desa",
  "role": "USER",
  "status_user": "INACTIVE",
  "phone_number": "081234567890",
  "created_at": "2024-02-07T08:00:00.000Z",
  "updated_at": "2024-02-07T08:00:00.000Z"
}
```

---

### 1.2 Login User
Authenticates a user and returns an access token.

- **URL**: `/api/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | String | Yes | Registered email address. |
| `password` | String | Yes | User's password. |

**Example Request:**
```json
{
  "email": "siti.aminah@example.com",
  "password": "securepassword123"
}
```

#### Response (200 OK)
Returns the user object (excluding sensitive info) and an access token.

```json
{
  "user": {
    "user_id": "uuid-string",
    "full_name": "Siti Aminah",
    "email": "siti.aminah@example.com",
    "position_user": "bidan_desa",
    "role": "USER",
    "status_user": "INACTIVE",
    "created_at": "...",
    "updated_at": "..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Get All Users
Retrieves a list of all users.

- **URL**: `/api/user`
- **Method**: `GET`

#### Response (200 OK)
Returns an array of user objects.

```json
[
  {
    "user_id": "uuid-1",
    "full_name": "Siti Aminah",
    "email": "siti.aminah@example.com",
    "address": "Jl. Mawar No. 10",
    "position_user": "bidan_desa",
    "role": "USER",
    "status_user": "INACTIVE",
    "phone_number": "081234567890",
    "created_at": "...",
    "updated_at": "..."
  },
  {
    "user_id": "uuid-2",
    "full_name": "Budi Santoso",
    "email": "budi@example.com",
    "address": "Jl. Melati No. 5",
    "position_user": "bidan_koordinator",
    "role": "ADMIN",
    "status_user": "ACTIVE",
    "phone_number": "08987654321",
    "created_at": "...",
    "updated_at": "..."
  }
]
```
