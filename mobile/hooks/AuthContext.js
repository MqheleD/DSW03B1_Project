import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/app/supabaseClient";

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
        }
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
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
              console.error("Error fetching profile:", profileError.message);
              setProfile(null);
              await AsyncStorage.removeItem("profile");
            } else {
              setProfile(profileData || null);
              if (profileData) {
                await AsyncStorage.setItem("profile", JSON.stringify(profileData));
              }
            }

            // Subscribe to changes for role updates etc.
            profileSubscription = supabase
              .channel(`public:attendees:id=eq.${newSession.user.id}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "attendees",
                  filter: `id=eq.${newSession.user.id}`,
                },
                (payload) => {
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
          console.error("Auth state change error:", error);
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
        return { success: false, message: error.message };
      }

      const { data: profileData, error: profileError } = await supabase
        .from("attendees")
        .select("*")
        .eq("id", signInData.user.id)
        .maybeSingle();

      if (profileError || !profileData) {
        return { success: false, message: "Profile not found." };
      }

      setSession(signInData.session);
      setProfile(profileData);

      await AsyncStorage.setItem("session", JSON.stringify(signInData.session));
      await AsyncStorage.setItem("profile", JSON.stringify(profileData));

      return { success: true, profile: profileData };
    } catch (error) {
      return { success: false, message: "Unexpected error during sign-in." };
    }
  };

  const signUpNewUser = async (email, password, role = "attendee") => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) return { success: false, message: error.message };

      // Optionally, insert user into attendees with role
      if (data.user) {
        await supabase.from("attendees").insert({
          id: data.user.id,
          email,
          role,
        });
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, message: "Unexpected error during sign-up." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      await AsyncStorage.removeItem("session");
      await AsyncStorage.removeItem("profile");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateProfile = async (newProfile) => {
    try {
      setProfile(newProfile);
      await AsyncStorage.setItem("profile", JSON.stringify(newProfile));
    } catch (error) {
      console.error("Failed to update local profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        role: profile?.role ?? null, // Easily access role anywhere
        loading,
        signInUser,
        signUpNewUser,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
