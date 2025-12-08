import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isLoggedIn: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isLoggedIn = !!user;

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);

        console.log(session?.user);

        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
        });

        subscription = authSubscription;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Error signing out: ", error);
    }
  }

  async function refetch() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut, isLoggedIn, refetch }}
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
