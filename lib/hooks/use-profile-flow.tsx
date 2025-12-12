import { useState } from "react";
import { useAuth } from "../providers/auth-provider";
import { UserProfile } from "../supabase/matches";
import { getCurrentUserProfile } from "../supabase/profile";
import { useAsyncHandler } from "./use-async-handler";

export function useProfileFlow() {
  const [profile, setProfile] = useState<UserProfile>();
  const [refreshing, setRefreshing] = useState(false);

  const { signOut } = useAuth();
  const { loading, message, type, run, setType, setMessage } =
    useAsyncHandler();

  const loadProfile = () =>
    run(async () => {
      setMessage("");
      const profileData = await getCurrentUserProfile();
      if (profileData.success && profileData.data) {
        setType("success");
        setMessage(profileData.message);
        setProfile(profileData.data);
        return;
      }

      setType("error");
      setMessage(profileData.message);
    });

  const refresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  return {
    loadProfile,
    loading,
    message,
    type,
    refresh,
    profile,
    refreshing,
    signOut,
  };
}
