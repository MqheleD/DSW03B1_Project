// hooks/useNotification.js
import { useState, useEffect } from "react";
import supabase from "../app/supabaseClient";
import { UserAuth } from "./AuthContext";

export default function useNotification() {
  const { profile } = UserAuth() || {};   // prevent destructuring crash
  const userId = profile?.id;

  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!userId) return; // don't subscribe until we have a logged-in user

    const channel = supabase
      .channel("db-changes-favorites")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        async (payload) => {
          try {
            // fetch user's favorited sessions
            const { data: favs, error } = await supabase
              .from("session_favorites")
              .select("session_id")
              .eq("user_id", userId);

            if (error) throw error;

            const favoritedSessionIds = favs.map((f) => f.session_id);
            if (!favoritedSessionIds.includes(payload.new?.id)) return;

            // notification message
            let message = "";
            let animation = require("@/assets/lottie/Alert Notification Character.json");

            switch (payload.eventType) {
              case "INSERT":
                message = `New favorited session added: ${payload.new.title}`;
                break;
              case "UPDATE":
                message = `Favorited session updated: ${payload.new.title}`;
                break;
              case "DELETE":
                message = `Favorited session removed`;
                break;
              default:
                return;
            }

            setNotification({ message, animation });
            setShowNotification(true);

            // auto-hide
            setTimeout(() => setShowNotification(false), 3000);
          } catch (err) {
            console.error("Error fetching favorites:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { notification, showNotification };
}
