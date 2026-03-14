---
milestone: M009
status: complete
---

# M009 — Enhanced Profile & Avatar Customization Summary

This milestone transformed the user identity experience, moving from static provider-locked profiles to fully customizable personas. Users can now choose their own display names and upload custom profile pictures, with everything synced in real-time and persisted across devices.

## Key Accomplishments

### Profile Customization
- **Name Unlocking:** Enabled name editing for all users in `ProfileSetupDialog`, regardless of whether they are guests or signed in via OAuth.
- **Custom Avatar Upload:** Implemented a full upload flow to Firebase Storage. Users can now upload PNG/JPG images to use as their avatar.
- **Client-side Optimization:** Added automatic image resizing and compression (400x400 max, JPEG) before upload to ensure fast loads and minimal storage impact.
- **Real-time Sync:** Enhanced the room socket integration to immediately broadcast avatar changes, ensuring other participants see the new identity instantly.

### Persistence & Identity
- **Firestore Integration:** Updated the server and database services to persist custom names and photo URLs in the `users` collection.
- **Cross-device Sync:** Integrated a mount-time sync in both the Dashboard and Room views that loads the user's latest custom profile from Firestore upon signing in.
- **Infrastructure Security:** Created `storage.rules` to secure the avatar bucket while allowing public viewing of profile pictures.

## Verification Results
- [x] Users can change names and avatars in real-time within a room.
- [x] Uploaded images are compressed and stored correctly in Firebase Storage.
- [x] Authenticated users' custom profiles persist and load correctly on new devices.
- [x] Build passes with all updated logic.

The identity system is now robust and provides the flexibility requested by users while maintaining the security and performance standards of the app.
