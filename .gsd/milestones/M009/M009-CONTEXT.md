# M009 — Enhanced Profile & Avatar Customization

## Context
Currently, authenticated users have their names locked to their OAuth provider's name, and their avatar is limited to DiceBear seeds or the OAuth photo. Users want more control over their identity, specifically the ability to edit their name and upload custom profile pictures.

## Goal
Enable flexible identity management for both guests and authenticated users, with custom image uploads and persistent storage.

## Constraints
- Authenticated users' profiles must persist in Firestore across sessions.
- Custom uploads should be stored in Firebase Storage.
- Guests still use localStorage + DiceBear as primary identity.
- No breaking changes to the real-time room synchronization.
