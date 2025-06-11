import { useRouter } from "expo-router";
import { useEffect } from "react";

import Login from "./(forms)/SignIn"; // Assuming SignIn is the login form component

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check auth status and navigate if already logged in
    // const isLoggedIn = checkAuthStatusSomehow();
    router.replace("/(forms)/Login"); // Redirect to LogIn form
    // if (isLoggedIn) {
    // }
  }, []);

  return <Login />;
}