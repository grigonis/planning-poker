---
milestone: M009
slice: S01
status: complete
---

# S01 Summary: Profile UI & Name Unlocking

This slice enables users to truly own their identity by unlocking the name input and ensuring custom profiles (name, avatar, and custom photos) persist across sessions and devices for authenticated users.

## Key Changes

### Client
- **ProfileSetupDialog:** Unlocked the name input for all users, including those signed in with Google/GitHub. Users can now choose a custom display name regardless of their OAuth provider's name.
- **Photo URL Handling:** Improved the flow for custom photo uploads and OAuth photos. The dialog now correctly prefers custom uploaded photos over OAuth defaults.
- **Room Sync:** Added a `useEffect` to `Room.jsx` that automatically fetches the latest user profile from Firestore upon connecting if the user is authenticated. This ensures identity sync on new devices.
- **Profile Removal:** Added the ability to remove a custom photo, reverting to the default avatar.

### Server
- **Persistence:** Updated the `save_user_profile` handler to accept and persist `avatarPhotoURL` to Firestore.
- **Validation:** Added sanitization and validation for `avatarPhotoURL` inputs on the server.
- **Firestore Schema:** Updated `upsertUser` and `getUserProfile` to consistently handle the `avatarPhotoURL` field.

## Verification
- [x] Name input is editable in all modes.
- [x] Profile changes (name, seed, photo) are emitted to the server and persisted to Firestore for authenticated users.
- [x] Authenticated users' profiles are automatically loaded when joining a room.
- [x] Custom photos can be removed.
