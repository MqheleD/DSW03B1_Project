// hooks/useNotification.js
import { useState, useEffect } from 'react';
import supabase from '../app/supabaseClient';

export default function useNotification() {
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          let message = '';
          let animation = require('@/assets/lottie/Alert Notification Character.json');

          switch (payload.eventType) {
            case 'INSERT':
              message = `New session added: ${payload.new.title}`;
              break;
            case 'UPDATE':
              message = `Session updated: ${payload.new.title}`;
              break;
            case 'DELETE':
              message = `Session removed`;
              animation = require('../assets/lottie/Alert Notification Character.json');
              break;
            default:
              return;
          }

          setNotification({ message, animation });
          setShowNotification(true);
          
          // Auto-hide after 3 seconds
          setTimeout(() => setShowNotification(false), 3000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return { notification, showNotification };
}