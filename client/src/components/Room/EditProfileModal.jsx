/**
 * EditProfileModal
 * Thin wrapper around ProfileSetupDialog in 'edit' mode.
 * Opened from the avatar button in RoomNavbar.
 */
import React from 'react';
import ProfileSetupDialog from '../ProfileSetupDialog';

const EditProfileModal = ({ isOpen, onClose, currentUser, onUpdateProfile }) => {
    return (
        <ProfileSetupDialog
            isOpen={isOpen}
            mode="edit"
            currentUser={currentUser}
            onUpdateProfile={onUpdateProfile}
            onClose={onClose}
        />
    );
};

export default EditProfileModal;
