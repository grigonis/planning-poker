---
milestone: M009
slice: S02
status: complete
---

# S02 Summary: Custom Avatar Upload

This slice implemented robust custom profile picture uploads with client-side optimization and secure storage configurations.

## Key Changes

### Infrastructure
- **Storage Rules:** Created `storage.rules` to allow public reads of avatars while restricting writes to valid images under 2MB.
- **Firebase Config:** Updated `firebase.json` to include the storage configuration.

### Client
- **Image Optimization:** Implemented `resizeImage` utility in `ProfileSetupDialog` that uses a canvas to downscale uploaded images to a maximum of 400x400 pixels and compress them to JPEG (85% quality). This ensures fast loads and minimizes storage costs.
- **Improved UX:** Updated the upload path to `avatars/{userId}/{timestamp}.jpg` for better organization and future-proofing.
- **Real-time Sync:** Enhanced `handleFileChange` to immediately emit an `update_profile` event when an upload completes in 'edit' mode, ensuring other participants see the new avatar instantly without requiring the user to click "Save Changes".
- **Dynamic Preview:** Updated the preview header in the join/edit dialog to correctly show the uploaded photo for both guests and authenticated users.

## Verification
- [x] Storage rules allow uploads and block non-image/oversized files.
- [x] Client-side resizing reduces multi-MB images to ~50KB.
- [x] Table avatars and participant list update immediately after upload.
- [x] Build passes with all changes.
