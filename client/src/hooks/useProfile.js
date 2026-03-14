import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const STORAGE_KEYS = {
    NAME: 'keystimate_user_name',
    AVATAR_SEED: 'keystimate_avatar_seed',
    USER_ID: 'keystimate_global_user_id',
    HISTORY: 'keystimate_room_history',
    SETTINGS: 'keystimate_settings'
};

export const useProfile = () => {
    const [profile, setProfile] = useState(() => {
        const savedName = localStorage.getItem(STORAGE_KEYS.NAME);
        const savedAvatar = localStorage.getItem(STORAGE_KEYS.AVATAR_SEED);
        let savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        
        if (!savedUserId) {
            savedUserId = uuidv4();
            localStorage.setItem(STORAGE_KEYS.USER_ID, savedUserId);
        }
        
        return {
            userId: savedUserId,
            name: savedName || '',
            avatarSeed: savedAvatar || null,
            avatarPhotoURL: null,   // set when authenticated via OAuth
            isSetup: !!(savedName && savedAvatar)
        };
    });

    // Sync Firebase auth user → profile (name + photo URL)
    // This runs once on mount and whenever auth state changes.
    // We only overwrite name/photo if the auth user has values — we never
    // clear them back to null when the user signs out (guest keeps their chosen name).
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setProfile(prev => {
                    const authName = firebaseUser.displayName || '';
                    const authPhoto = firebaseUser.photoURL || null;

                    // Only update name from auth if the user hasn't manually set one,
                    // OR if the auth name is available (auth name takes precedence when present).
                    const newName = authName || prev.name;
                    const newPhotoURL = authPhoto;

                    // Persist auth name to localStorage so it survives refresh
                    if (authName) {
                        localStorage.setItem(STORAGE_KEYS.NAME, authName);
                    }

                    return {
                        ...prev,
                        name: newName,
                        avatarPhotoURL: newPhotoURL,
                        isSetup: !!(newName && (prev.avatarSeed || newPhotoURL))
                    };
                });
            } else {
                // Signed out — clear photo URL but keep name/seed
                setProfile(prev => ({
                    ...prev,
                    avatarPhotoURL: null,
                    isSetup: !!(prev.name && prev.avatarSeed)
                }));
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
