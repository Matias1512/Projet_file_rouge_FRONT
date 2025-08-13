import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

export const useBadgeNotifications = () => {
  const [newBadges, setNewBadges] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const checkForNewBadges = async () => {
    if (!user || !user.userId) return;

    try {
      const response = await axios.post(`https://schooldev.duckdns.org/api/badges/evaluate/${user.userId}`);
      const earnedBadges = response.data;

      if (earnedBadges && earnedBadges.length > 0) {
        setNewBadges(earnedBadges);
        setIsNotificationOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des nouveaux badges:', error);
    }
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
    setNewBadges([]);
  };

  return {
    newBadges,
    isNotificationOpen,
    checkForNewBadges,
    closeNotification
  };
};