/**
 * Универсальная страница профиля пользователя
 * Используется для всех ролей: admin, teacher, student
 */

import { useState } from 'react';
import { ProfileView, ProfileEdit } from '@/modules/profile/components';
import './userProfilePage.css';

const UserProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveSuccess = () => {
    setIsEditing(false);
  };
  
  return (
    <div className="user-profile-page">
      {isEditing ? (
        <ProfileEdit 
          onCancel={handleCancelEdit}
          onSuccess={handleSaveSuccess}
        />
      ) : (
        <ProfileView onEdit={handleEditClick} />
      )}
    </div>
  );
};

export default UserProfilePage;