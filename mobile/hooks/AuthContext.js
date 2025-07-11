import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/app/supabaseClient"; // Notice default import here

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileSubscription = null;

    const loadStoredData = async () => {
      try {
        const storedSession = await AsyncStorage.getItem("session");
        const storedProfile = await AsyncStorage.getItem("profile");

        if (storedSession) {
          setSession(JSON.parse(storedSession));
          console.log("[AuthContext] Loaded session from AsyncStorage");
        }
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
          console.log("[AuthContext] Loaded profile from AsyncStorage");
        }
      } catch (error) {
        console.error("[AuthContext] Error loading stored data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[AuthContext] Auth state changed:", event);

        try {
          if (profileSubscription) {
            profileSubscription.unsubscribe();
            profileSubscription = null;
          }

          if (newSession) {
            setSession(newSession);
            await AsyncStorage.setItem("session", JSON.stringify(newSession));

            const { data: profileData, error: profileError } = await supabase
              .from("attendees")
              .select("*")
              .eq("id", newSession.user.id)
              .maybeSingle();

            if (profileError) {
              console.error("[AuthContext] Profile fetch error:", profileError);
              setProfile(null);
              await AsyncStorage.removeItem("profile");
            } else {
              setProfile(profileData || null);
              if (profileData) {
                await AsyncStorage.setItem("profile", JSON.stringify(profileData));
                console.log("[AuthContext] Profile found:", profileData);
              } else {
                await AsyncStorage.removeItem("profile");
              }
            }

            // Subscribe to realtime updates on this user's attendee row
            profileSubscription = supabase
              .channel(`public:attendees:id=eq.${newSession.user.id}`)
              .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "attendees", filter: `id=eq.${newSession.user.id}` },
                (payload) => {
                  console.log("[AuthContext] Realtime profile update:", payload);
                  if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
                    setProfile(payload.new);
                    AsyncStorage.setItem("profile", JSON.stringify(payload.new));
                  }
                  if (payload.eventType === "DELETE") {
                    setProfile(null);
                    AsyncStorage.removeItem("profile");
                  }
                }
              )
              .subscribe();
          } else {
            setSession(null);
            setProfile(null);
            await AsyncStorage.removeItem("session");
            await AsyncStorage.removeItem("profile");
          }
        } catch (error) {
          console.error("[AuthContext] Auth state change error:", error);
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      if (profileSubscription) {
        profileSubscription.unsubscribe();
      }
    };
  }, []);


  const signInUser = async (email, password) => {
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.warn("[AuthContext] Sign-in error:", error.message);
        return { success: false, message: error.message };
      }

      if (!signInData || !signInData.user) {
        return { success: false, message: "Invalid sign-in response." };
      }

      const { data: profileData, error: profileError } = await supabase
        .from("attendees")
        .select("*")
        .eq("id", signInData.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn("[AuthContext] Profile fetch error:", profileError.message);
        return { success: false, message: "Could not load profile." };
      }

      setSession(signInData.session);
      setProfile(profileData);

      await AsyncStorage.setItem("session", JSON.stringify(signInData.session));
      if (profileData) {
        await AsyncStorage.setItem("profile", JSON.stringify(profileData));
      }

      return { success: true, profile: profileData };
    } catch (error) {
      console.error("[AuthContext] Unexpected login error:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  };

  const signUpNewUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        console.warn("[AuthContext] Sign-up error:", error.message);
        return { success: false, message: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("[AuthContext] Unexpected sign-up error:", error);
      return { success: false, message: "An unexpected error occurred." };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.warn("[AuthContext] Logout error:", error.message);
        return;
      }

      setSession(null);
      setProfile(null);
      await AsyncStorage.removeItem("session");
      await AsyncStorage.removeItem("profile");
    } catch (error) {
      console.error("[AuthContext] Logout failed:", error);
    }
  };

  const updateProfile = async (newProfile) => {
    try {
      setProfile(newProfile);
      await AsyncStorage.setItem("profile", JSON.stringify(newProfile));
    } catch (error) {
      console.error("[AuthContext] Failed to update local profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signInUser,
        signOut,
        signUpNewUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
