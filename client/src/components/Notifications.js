import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // 1. Fetch unread notifications when component loads
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
  }, []);

  // 2. When the bell is clicked...
  const handleToggle = async () => {
    setIsOpen(!isOpen);
    
    // 3. If opening and there are unread notifications...
    if (!isOpen && notifications.length > 0) {
      try {
        // 4. Tell the server to mark them as read
        await api.post('/notifications/mark-read');
        // We'll leave them in the list until the next page load
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    // 5. Navigate to the link (e.g., /project/123)
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <li className="notification-bell">
      <span onClick={handleToggle} style={{ cursor: 'pointer', position: 'relative' }}>
        {/* The Bell Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* The Red Dot */}
        {notifications.length > 0 && <div className="notification-dot"></div>}
      </span>
      
      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-item">No new notifications</div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif._id} 
                className="notification-item" 
                onClick={() => handleNotificationClick(notif)}
              >
                {notif.text}
              </div>
            ))
          )}
        </div>
      )}
    </li>
  );
};

export default Notifications;