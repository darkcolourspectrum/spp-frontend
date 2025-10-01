/**
 * Страница профиля студента
 */

import { useState } from 'react';
import { ProfileView, ProfileEdit } from '@/modules/profile/components';
import './studentProfilePage.css';

const StudentProfilePage = () => {
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
    <div className="student-profile-page">
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

export default StudentProfilePage;