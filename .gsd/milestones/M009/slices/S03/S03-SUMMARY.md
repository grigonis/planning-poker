---
milestone: M009
slice: S03
status: complete
---

# S03 Summary: Persistence & Sync

This slice completed the identity system by ensuring all profile changes, including custom photos, are correctly persisted and synced across devices for authenticated users.

## Key Changes

### Client
- **Join-mode Persistence:** Updated `ProfileSetupDialog` to call `save_user_profile` during the initial join flow if the user is authenticated. This ensures that any name or avatar changes made at the moment of joining a room are immediately saved to the user's permanent profile in Firestore.
- **Verification:** Verified that `Dashboard.jsx` and `Room.jsx` correctly load the custom profile from Firestore on mount/sign-in, providing a seamless transition between devices.

### Server
- **Schema Stability:** Confirmed that `upsertUser` handles custom fields (`name`, `avatarSeed`, `avatarPhotoURL`) independently of OAuth metadata, preventing data loss during reconnection.

## Verification
- [x] Profiles sync immediately to Firestore on room join and edit.
- [x] New sessions on different devices correctly load the user's custom profile upon signing in.
- [x] Build passes with all changes.
