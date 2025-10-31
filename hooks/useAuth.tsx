import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile } from '../types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This flag ensures we ignore the initial session restoration event from Supabase.
    let isInitialLoad = true;

    // Force a sign-out on every page load and synchronously update the state.
    // This provides an immediate UI update to show the login screen without a spinner.
    supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // The first event fired by the listener on page load is from automatic session
      // restoration. We must ignore it to prevent it from overriding our forced logout.
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      // After the initial load, we handle user-initiated events normally.
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        const currentUser = session.user;
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error || !profileData) {
          console.error('Login successful but profile fetch failed. Logging out.', error);
          await supabase.auth.signOut(); // This will trigger the 'SIGNED_OUT' event.
        } else {
          setUser(currentUser);
          setProfile(profileData);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // The empty dependency array ensures this runs only once on mount.
  
  const login = async (email: string, pass: string) => {
    // The onAuthStateChange listener will handle setting user/profile state upon success.
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const logout = async () => {
    // The onAuthStateChange listener will handle clearing user/profile state.
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
