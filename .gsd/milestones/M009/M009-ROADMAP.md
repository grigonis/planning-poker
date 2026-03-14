# M009 — Enhanced Profile & Avatar Customization

**Vision:** A seamless identity experience where users can truly own their persona through custom names and uploaded avatars.

## Success Criteria

- Users can change their display name regardless of authentication status.
- Users can upload a custom profile picture (PNG/JPG) which is persisted in the database.
- Authenticated users' custom profiles (name, avatarSeed, photoURL) sync across devices.
- Real-time room participants see updated profiles immediately.

## Key Risks / Unknowns

- Firebase Storage configuration — ensuring the bucket is accessible and rules are set.
- Image optimization — preventing multi-MB uploads from slowing down the experience.

## Slices

- [x] **S01: Profile UI & Name Unlocking** `risk:low` `depends:[]`
  > After this: Users can edit their name in ProfileSetupDialog; server handles name/avatar updates correctly.
- [ ] **S02: Custom Avatar Upload** `risk:high` `depends:[S01]`
  > After this: Users can upload images to Firebase Storage and use them as their avatar.
- [ ] **S03: Persistence & Sync** `risk:medium` `depends:[S02]`
  > After this: Custom profiles are saved to Firestore for authenticated users and persist across sessions.

## Milestone Definition of Done

- Name editing is unlocked in ProfileSetupDialog.
- Image upload works and displays in real-time.
- Profiles persist in Firestore and localStorage.
- End-to-end verification of profile change and persistence.
