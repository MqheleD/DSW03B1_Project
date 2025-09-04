// components/NotificationProvider.js
import React from "react";
import NotificationBanner from "./NotificationBanner";
import useNotificationManager from "@/hooks/useNotificationManager";

export default function NotificationProvider({ children }) {
  const { currentNotification } = useNotificationManager();

  return (
    <>
      {children}
      {currentNotification && (
        <NotificationBanner
          message={currentNotification.message}
          animation={currentNotification.animation}
          visible={!!currentNotification}
          type={currentNotification.type}
          onHide={() => {}}
        />
      )}
    </>
  );
}
// components/NotificationProvider.js
import React from "react";
import NotificationBanner from "./NotificationBanner";
import useNotificationManager from "@/hooks/useNotificationManager";

export default function NotificationProvider({ children }) {
  const { currentNotification } = useNotificationManager();

  return (
    <>
      {children}
      {currentNotification && (
        <NotificationBanner
          message={currentNotification.message}
          animation={currentNotification.animation}
          visible={!!currentNotification}
          type={currentNotification.type}
          onHide={() => {}}
        />
      )}
    </>
  );
}
