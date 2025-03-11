
# API Endpoints Documentation

This document provides a comprehensive list of all required API endpoints for the Room Booking System.

## Base URL

All endpoints should be prefixed with: `/api`

## Authentication Endpoints

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "name": "User Name",
        "email": "user@example.com",
        "role": "student|guard|admin"
      },
      "token": "jwt_token_string"
    }
  }
  ```

### Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "role": "student|guard|admin"
    }
  }
  ```

## Rooms Endpoints

### Get All Rooms
- **URL**: `/rooms`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `type` (optional): Filter by room type
  - `building` (optional): Filter by building
  - `status` (optional): Filter by status
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "A101",
        "name": "Lecture Hall A101",
        "building": "Main Building",
        "capacity": 100,
        "type": "lecture",
        "features": ["projector", "whiteboard"],
        "status": "available",
        "floor": 1,
        "description": "Optional description"
      }
    ]
  }
  ```

### Get Room by ID
- **URL**: `/rooms/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "A101",
      "name": "Lecture Hall A101",
      "building": "Main Building",
      "capacity": 100,
      "type": "lecture",
      "features": ["projector", "whiteboard"],
      "status": "available",
      "floor": 1,
      "description": "Optional description"
    }
  }
  ```

### Create Room
- **URL**: `/rooms`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "id": "A101",
    "name": "Lecture Hall A101",
    "building": "Main Building",
    "capacity": 100,
    "type": "lecture",
    "features": ["projector", "whiteboard"],
    "status": "available",
    "floor": 1,
    "description": "Optional description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "A101",
      "name": "Lecture Hall A101",
      "building": "Main Building",
      "capacity": 100,
      "type": "lecture",
      "features": ["projector", "whiteboard"],
      "status": "available",
      "floor": 1,
      "description": "Optional description"
    }
  }
  ```

### Update Room
- **URL**: `/rooms/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "name": "Updated Lecture Hall A101",
    "building": "Main Building",
    "capacity": 120,
    "type": "lecture",
    "features": ["projector", "whiteboard", "computer"],
    "status": "available",
    "floor": 1,
    "description": "Updated description"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "A101",
      "name": "Updated Lecture Hall A101",
      "building": "Main Building",
      "capacity": 120,
      "type": "lecture",
      "features": ["projector", "whiteboard", "computer"],
      "status": "available",
      "floor": 1,
      "description": "Updated description"
    }
  }
  ```

### Delete Room
- **URL**: `/rooms/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Get Room Availability
- **URL**: `/rooms/{id}/availability`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `date`: Date in format YYYY-MM-DD
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "start": "2023-06-01T08:00:00",
        "end": "2023-06-01T09:00:00",
        "status": "available"
      },
      {
        "start": "2023-06-01T09:00:00",
        "end": "2023-06-01T10:00:00",
        "status": "booked",
        "booking_id": 123
      }
    ]
  }
  ```

## Bookings Endpoints

### Get All Bookings
- **URL**: `/bookings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `status` (optional): Filter by status
  - `start_date` (optional): Filter by start date
  - `end_date` (optional): Filter by end date
  - `room` (optional): Filter by room ID
- **Access**: Admin and Guard can see all bookings, Students only see their own
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "room": "A101",
        "student_id": 1,
        "student_name": "John Smith",
        "start": "2023-06-01T10:00:00",
        "end": "2023-06-01T12:00:00",
        "status": "confirmed",
        "key_issued": false,
        "key_returned": false,
        "access_code": "1234-5678",
        "notes": "Optional notes",
        "created_at": "2023-05-30T14:00:00",
        "updated_at": "2023-05-30T15:00:00"
      }
    ]
  }
  ```

### Get Booking by ID
- **URL**: `/bookings/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin and Guard can see all bookings, Students only see their own
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "room": "A101",
      "student_id": 1,
      "student_name": "John Smith",
      "start": "2023-06-01T10:00:00",
      "end": "2023-06-01T12:00:00",
      "status": "confirmed",
      "key_issued": false,
      "key_returned": false,
      "access_code": "1234-5678",
      "notes": "Optional notes",
      "created_at": "2023-05-30T14:00:00",
      "updated_at": "2023-05-30T15:00:00"
    }
  }
  ```

### Get Bookings by User
- **URL**: `/bookings/user/{userId}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin can see all, Students only see their own
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "room": "A101",
        "student_id": 1,
        "student_name": "John Smith",
        "start": "2023-06-01T10:00:00",
        "end": "2023-06-01T12:00:00",
        "status": "confirmed",
        "key_issued": false,
        "key_returned": false,
        "access_code": "1234-5678",
        "notes": "Optional notes",
        "created_at": "2023-05-30T14:00:00",
        "updated_at": "2023-05-30T15:00:00"
      }
    ]
  }
  ```

### Create Booking
- **URL**: `/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Students only
- **Request Body**:
  ```json
  {
    "room": "A101",
    "start": "2023-06-01T10:00:00",
    "end": "2023-06-01T12:00:00",
    "notes": "Optional notes"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "room": "A101",
      "student_id": 1,
      "student_name": "John Smith",
      "start": "2023-06-01T10:00:00",
      "end": "2023-06-01T12:00:00",
      "status": "pending",
      "key_issued": false,
      "key_returned": false,
      "access_code": "1234-5678",
      "notes": "Optional notes",
      "created_at": "2023-05-30T14:00:00",
      "updated_at": "2023-05-30T14:00:00"
    }
  }
  ```

### Update Booking
- **URL**: `/bookings/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin and Guard can update status, Students can only cancel their own
- **Request Body**:
  ```json
  {
    "status": "confirmed",
    "notes": "Updated notes"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "room": "A101",
      "student_id": 1,
      "student_name": "John Smith",
      "start": "2023-06-01T10:00:00",
      "end": "2023-06-01T12:00:00",
      "status": "confirmed",
      "key_issued": false,
      "key_returned": false,
      "access_code": "1234-5678",
      "notes": "Updated notes",
      "created_at": "2023-05-30T14:00:00",
      "updated_at": "2023-05-30T15:00:00"
    }
  }
  ```

### Cancel Booking
- **URL**: `/bookings/{id}/cancel`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin, Guard, and Student who owns the booking
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "cancelled",
      "updated_at": "2023-05-30T16:00:00"
    }
  }
  ```

### Issue Key
- **URL**: `/bookings/{id}/issue-key`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Guard only
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "key_issued": true,
      "updated_at": "2023-06-01T10:05:00"
    }
  }
  ```

### Return Key
- **URL**: `/bookings/{id}/return-key`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Guard only
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "key_issued": true,
      "key_returned": true,
      "status": "completed",
      "updated_at": "2023-06-01T12:05:00"
    }
  }
  ```

## Users Endpoints

### Get All Users
- **URL**: `/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Query Parameters**:
  - `role` (optional): Filter by role
  - `active` (optional): Filter by active status
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "John Smith",
        "email": "john@example.com",
        "role": "student",
        "department": "Computer Science",
        "phone": "1234567890",
        "active": true,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
      }
    ]
  }
  ```

### Get User by ID
- **URL**: `/users/{id}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin can see all, Users can only see themselves
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "role": "student",
      "department": "Computer Science",
      "phone": "1234567890",
      "active": true,
      "created_at": "2023-01-01T00:00:00",
      "updated_at": "2023-01-01T00:00:00"
    }
  }
  ```

### Create User
- **URL**: `/users`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "email": "john@example.com",
    "role": "student",
    "department": "Computer Science",
    "phone": "1234567890",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "role": "student",
      "department": "Computer Science",
      "phone": "1234567890",
      "active": true,
      "created_at": "2023-05-30T14:00:00",
      "updated_at": "2023-05-30T14:00:00"
    }
  }
  ```

### Update User
- **URL**: `/users/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin can update all, Users can only update themselves
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "department": "Updated Department",
    "phone": "0987654321"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Updated Name",
      "email": "updated@example.com",
      "role": "student",
      "department": "Updated Department",
      "phone": "0987654321",
      "active": true,
      "updated_at": "2023-05-30T15:00:00"
    }
  }
  ```

### Delete User
- **URL**: `/users/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Change Password
- **URL**: `/users/{id}/change-password`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin can change for all, Users can only change their own
- **Request Body**:
  ```json
  {
    "oldPassword": "oldPassword123",
    "newPassword": "newPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```

## Settings Endpoints

### Get All Settings
- **URL**: `/settings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "bookingApprovalRequired": true,
      "maxBookingDurationHours": 4,
      "maxActiveBookingsPerUser": 3,
      "allowedBookingDaysInAdvance": 14,
      "workingHoursStart": "08:00",
      "workingHoursEnd": "21:00"
    }
  }
  ```

### Update Settings
- **URL**: `/settings`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "bookingApprovalRequired": false,
    "maxBookingDurationHours": 6,
    "maxActiveBookingsPerUser": 5,
    "allowedBookingDaysInAdvance": 30,
    "workingHoursStart": "07:00",
    "workingHoursEnd": "22:00"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "bookingApprovalRequired": false,
      "maxBookingDurationHours": 6,
      "maxActiveBookingsPerUser": 5,
      "allowedBookingDaysInAdvance": 30,
      "workingHoursStart": "07:00",
      "workingHoursEnd": "22:00"
    }
  }
  ```

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

Common error status codes:
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid authentication
- 403: Forbidden - Not enough permissions
- 404: Not Found - Resource not found
- 409: Conflict - Resource already exists or another conflict
- 500: Internal Server Error - Server-side error

## Authentication and Authorization

- All endpoints except for login require authentication via JWT token
- The token should be included in the Authorization header as `Bearer {token}`
- Different endpoints require different roles:
  - Student can create bookings and manage their own bookings
  - Guard can manage keys, confirm/reject bookings
  - Admin has full access to all resources
