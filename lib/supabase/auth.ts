import { supabase } from "./supabase";

export function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // login implementation
  return supabase.auth.signInWithPassword({ email, password });
}
