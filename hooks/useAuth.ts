import { clearSession, clearUser, setUser, setUserSession } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";

function useAuth() {
  const dispatch = useDispatch();

  // Check for existing session on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          dispatch(setUser(session.user));
          dispatch(setUserSession(session));
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          dispatch(setUser(session.user));
          dispatch(setUserSession(session));
        } else {
          dispatch(clearUser());
          dispatch(clearSession());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };
}

export default useAuth;
