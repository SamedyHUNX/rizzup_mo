import { UserProfile } from "@/types/users.type";
import { useCallback, useState } from "react";
import { getUserMatches } from "../supabase/functions/matches";
import { useAsyncHandler } from "./use-async-handler";

export function useMatchedFlow() {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const { loading, message, type, run } = useAsyncHandler();

  const get = useCallback(
    () =>
      run(async () => {
        const userMatches = await getUserMatches();
        if (userMatches.success && userMatches.data) {
          setMatches(userMatches.data);
        }
      }),
    [run]
  );

  return {
    get,
    loading,
    message,
    type,
    matches,
  };
}
