import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="profile-header">
      <h1>My Profile</h1>
      <p>{currentDate} | Complete your profile to increase job match accuracy.</p>
    </div>
  );
};

export default ProfileHeader;