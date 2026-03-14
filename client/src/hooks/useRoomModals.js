import { useState } from 'react';

export const useRoomModals = () => {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
    const [isCustomizeCardsOpen, setIsCustomizeCardsOpen] = useState(false);
    const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);

    return {
        isInviteOpen, setIsInviteOpen,
        isSettingsOpen, setIsSettingsOpen,
        isEditRoomOpen, setIsEditRoomOpen,
        isCustomizeCardsOpen, setIsCustomizeCardsOpen,
        isManageGroupsOpen, setIsManageGroupsOpen,
        isProfileOpen, setIsProfileOpen,
        isSignInOpen, setIsSignInOpen,
        isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen,
    };
};
