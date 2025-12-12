import { useCallback, useState } from "react";
import { getUserMatches, UserProfile } from "../supabase/matches";
import { useAsyncHandler } from "./use-async-handler";

export function useMatchedFlow() {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const { loading, message, type, run, setType, setMessage } =
    useAsyncHandler();

  const get = useCallback(
    () =>
      run(async () => {
        setMessage("");
        const userMatches = await getUserMatches();
        if (userMatches.success && userMatches.data) {
          setMessage(userMatches.message);
          setType("success");
          setMatches(userMatches.data);
          return;
        }

        setType("error");
        setMessage(userMatches.message);
      }),
    [run, setMessage, setType]
  );

  return {
    get,
    loading,
    message,
    type,
    matches,
  };
}
