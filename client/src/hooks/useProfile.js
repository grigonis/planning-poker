import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
            isSetup: !!(savedName && savedAvatar)
        };
    });

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
            isSetup: !!(newProfile.name && newProfile.avatarSeed)
        });
    };

    return {
        ...profile,
        updateProfile,
        STORAGE_KEYS
    };
};
