# Admin Utilities

This module provides helper functions for managing admin users in the Cyborg Robotics Academy platform.

## Functions

### createAdminUser

Creates an admin user document in Firestore.

```typescript
createAdminUser(
  uid: string,
  email: string,
  name: string,
  username?: string
): Promise<void>
```

**Parameters:**

- `uid` - Firebase user UID
- `email` - User's email address
- `name` - User's full name
- `username` - User's username (optional)

**Returns:** Promise<void>

### isAdminUser

Checks if an admin user document exists in Firestore.

```typescript
isAdminUser(uid: string): Promise<boolean>
```

**Parameters:**

- `uid` - Firebase user UID

**Returns:** Promise<boolean> - true if admin document exists, false otherwise

### getAdminUserData

Gets admin user data from Firestore.

```typescript
getAdminUserData(uid: string): Promise<object | null>
```

**Parameters:**

- `uid` - Firebase user UID

**Returns:** Promise<object | null> - Admin data or null if not found

## Usage

Import the functions in your components:

```typescript
import {
  createAdminUser,
  isAdminUser,
  getAdminUserData,
} from "@/lib/admin-utils";
```

### Example: Creating an Admin User

```typescript
try {
  await createAdminUser(
    "user-uid-123",
    "admin@example.com",
    "Admin User",
    "adminuser"
  );
  console.log("Admin user created successfully");
} catch (error) {
  console.error("Failed to create admin user:", error);
}
```

### Example: Checking if User is Admin

```typescript
const isAdmin = await isAdminUser("user-uid-123");
if (isAdmin) {
  console.log("User is an admin");
} else {
  console.log("User is not an admin");
}
```

### Example: Getting Admin User Data

```typescript
const adminData = await getAdminUserData("user-uid-123");
if (adminData) {
  console.log("Admin data:", adminData);
} else {
  console.log("Admin user not found");
}
```
