import { UserProfile } from "@/types/users.type";
import { useCallback, useState } from "react";
import { useAuth } from "../providers/auth-provider";
import { getCurrentUserProfile } from "../supabase/functions/profile";
import { useAsyncHandler } from "./use-async-handler";

export function useProfileFlow() {
  const [profile, setProfile] = useState<UserProfile>();
  const [refreshing, setRefreshing] = useState(false);

  const { signOut } = useAuth();
  const { loading, message, type, run } = useAsyncHandler();

  const loadProfile = useCallback(
    () =>
      run(async () => {
        const profileData = await getCurrentUserProfile();
        if (profileData.success && profileData.data) {
          setProfile(profileData.data);
        }
      }),
    [run]
  );

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
