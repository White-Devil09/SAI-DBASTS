import React from 'react';

const Profile = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    messageBox: {
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: '20px 30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      textAlign: 'center',
    },
    messageText: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.messageBox}>
        <p style={styles.messageText}>Logged in successfully.</p>
      </div>
    </div>
  );
};

export default Profile;
