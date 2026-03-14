import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const STORAGE_KEYS = {
    NAME: 'keystimate_user_name',
    AVATAR_SEED: 'keystimate_avatar_seed',
    AVATAR_PHOTO_URL: 'keystimate_avatar_photo_url',
    USER_ID: 'keystimate_global_user_id',
    HISTORY: 'keystimate_room_history',
    SETTINGS: 'keystimate_settings'
};

export const useProfile = () => {
    const [profile, setProfile] = useState(() => {
        const savedName = localStorage.getItem(STORAGE_KEYS.NAME);
        const savedAvatar = localStorage.getItem(STORAGE_KEYS.AVATAR_SEED);
        const savedPhotoURL = localStorage.getItem(STORAGE_KEYS.AVATAR_PHOTO_URL);
        let savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        
        if (!savedUserId) {
            savedUserId = uuidv4();
            localStorage.setItem(STORAGE_KEYS.USER_ID, savedUserId);
        }
        
        return {
            userId: savedUserId,
            name: savedName || '',
            avatarSeed: savedAvatar || null,
            avatarPhotoURL: savedPhotoURL || null,
            isSetup: !!(savedName && (savedAvatar || savedPhotoURL))
        };
    });

    // Sync Firebase auth user → profile (name + photo URL)
    // This runs once on mount and whenever auth state changes.
    // We only overwrite name/photo if we don't already have local ones, 
    // or to provide the initial auth values.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setProfile(prev => {
                    const authName = firebaseUser.displayName || '';
                    const authPhoto = firebaseUser.photoURL || null;

                    // If we have a stored name/photo, they take precedence over OAuth 
                    // (user previously edited their profile).
                    const newName = prev.name || authName;
                    const newPhotoURL = prev.avatarPhotoURL || authPhoto;

                    // Persist to localStorage if we got something new
                    if (newName && !localStorage.getItem(STORAGE_KEYS.NAME)) {
                        localStorage.setItem(STORAGE_KEYS.NAME, newName);
                    }
                    if (newPhotoURL && !localStorage.getItem(STORAGE_KEYS.AVATAR_PHOTO_URL)) {
                        localStorage.setItem(STORAGE_KEYS.AVATAR_PHOTO_URL, newPhotoURL);
                    }

                    return {
                        ...prev,
                        name: newName,
                        avatarPhotoURL: newPhotoURL,
                        isSetup: !!(newName && (prev.avatarSeed || newPhotoURL))
                    };
                });
            } else {
                // Signed out — clear photo URL from profile if it matched auth, 
                // but keep it if it was a custom upload (well, custom upload should 
                // probably survive signout if it's public, but let's keep it simple for now).
                // Actually, let's keep it in localStorage regardless.
            }
        });
        return unsubscribe;
    }, []);

    const updateProfile = (updates) => {
        const newProfile = { ...profile, ...updates };
        
        if (updates.name !== undefined) {
            localStorage.setItem(STORAGE_KEYS.NAME, updates.name);
        }
        if (updates.avatarSeed !== undefined) {
            localStorage.setItem(STORAGE_KEYS.AVATAR_SEED, updates.avatarSeed);
        }
        if (updates.avatarPhotoURL !== undefined) {
            if (updates.avatarPhotoURL) {
                localStorage.setItem(STORAGE_KEYS.AVATAR_PHOTO_URL, updates.avatarPhotoURL);
            } else {
                localStorage.removeItem(STORAGE_KEYS.AVATAR_PHOTO_URL);
            }
        }
        
        setProfile({
            ...newProfile,
            isSetup: !!(newProfile.name && (newProfile.avatarSeed || newProfile.avatarPhotoURL))
        });
    };

    return {
        ...profile,
        updateProfile,
        STORAGE_KEYS
    };
};
