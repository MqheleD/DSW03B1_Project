// hooks/useNotificationManager.js
import { useState, useEffect, useCallback } from "react";
import supabase from "../app/supabaseClient";
import { UserAuth } from "./AuthContext";

const NOTIFICATION_DURATION = 3000;

export default function useNotificationManager() {
  const { profile } = UserAuth() || {};
  const userId = profile?.id;

  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  // Show next notification
  const showNext = useCallback(() => {
    if (queue.length === 0) {
      setCurrent(null);
      return;
    }
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);

    setTimeout(() => {
      showNext();
    }, NOTIFICATION_DURATION);
  }, [queue]);

  // Add a new notification to the queue
  const pushNotification = useCallback((notification) => {
    setQueue((prev) => [...prev, notification]);
    if (!current) {
      showNext();
    }
  }, [current, showNext]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("db-changes-favorites")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        async (payload) => {
          try {
            const { data: favs, error } = await supabase
              .from("session_favorites")
              .select("session_id")
              .eq("user_id", userId);

            if (error) throw error;

            const favoritedSessionIds = favs.map((f) => f.session_id);
            const sessionId = payload.new?.id || payload.old?.id;

            if (!favoritedSessionIds.includes(sessionId)) return;

            // Build message & type
            let message = "";
            let type = "info"; // default
            let animation = require("@/assets/lottie/Alert Notification Character.json");

            switch (payload.eventType) {
              case "INSERT":
                message = `New favorited session added: ${payload.new.title}`;
                type = "success";
                break;
              case "UPDATE":
                message = `Favorited session updated: ${payload.new.title}`;
                type = "warning";
                break;
              case "DELETE":
                message = `Favorited session removed: ${payload.old.title || ""}`;
                type = "error";
                break;
              default:
                return;
            }

            pushNotification({ message, animation, type });
          } catch (err) {
            console.error("Error fetching favorites:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pushNotification]);

  return { currentNotification: current };
}
