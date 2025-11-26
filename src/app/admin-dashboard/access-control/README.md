# Access Control Management

This module provides administrators with tools to manage user roles, permissions and access levels within the Cyborg Robotics Academy platform.

## Features

- View all users across different roles (students, trainers, admins)
- Filter users by role, status, or search term
- Edit user information including role and status
- Delete users from the system
- View statistics on user counts and distributions

## Implementation Details

The access control page is built as a standalone page within the admin dashboard, accessible at `/admin-dashboard/access-control`. It fetches user data from Firebase Firestore collections and provides real-time management capabilities.

### Data Structure

Users are organized in Firestore collections by role:

- `students` - Student users
- `trainers` - Trainer users
- `admins` - Administrator users

Each user document contains:

- `name` - User's full name
- `email` - User's email address
- `status` - User status (active, inactive, pending)
- `createdAt` - Account creation timestamp

## Usage

1. Navigate to the Admin Dashboard
2. Click on the "Access Control" card
3. Use filters to find specific users
4. Edit user information using the pencil icon
5. Delete users using the trash icon
6. View statistics in the summary cards at the top

## Security

All operations are protected and require administrator privileges. The system validates user roles before allowing any modifications.
