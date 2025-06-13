import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "@/app/supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState("unefined")

    // sign in logic for supabase
    const signUpNewUser = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error){
            console.log("There was an error siging up")
            return {success: false, error}
        }
        return {success: true, data}
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        });
    }, []);

    // sign in
    const signInUser = async ({ email, password}) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.log("Sign in error: ", error)
                return { success: false, error: error.message}
            }
            console.log("Sign in success: ", data)
            return { success: true, data}
        } 
        
        catch (error) {
            console.log("AN error occured: ", error)
        }
    }

    const signOut = () => {
        const {error} = supabase.auth.signOut();

        if (error) {
            console.log("ther was an error: ", error)
        }
    }

    return(
        <AuthContext.Provider value = {{ session, signUpNewUser, signInUser, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}