import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAsyncHandler } from "../hooks/use-async-handler";
import { supabase } from "../supabase/supabase";

interface AuthContextType {
  user: User | null;
  error: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  success: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { loading, message, type, run } = useAsyncHandler();

  const isLoggedIn = !!user;

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    run(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setInitialized(true);

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setSuccess(true);
        setInitialized(true);
      });

      subscription = authSubscription;
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    run(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
    });

  const signOut = () =>
    run(async () => {
      await supabase.auth.signOut();
      setInitialized(false);
      setUser(null);
    });

  const refetch = () =>
    run(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        isLoggedIn,
        refetch,
        signIn,
        error: type === "error" ? message : "",
        initialized,
        success,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
