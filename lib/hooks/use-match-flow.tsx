import { useState } from "react";
import {
  getPotentialMatches,
  likeUser,
  passUser,
  resetPasses,
  UserProfile,
} from "../supabase/matches";
import { useAsyncHandler } from "./use-async-handler";

export function useMatchFlow() {
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);

  const { loading, message, type, run } = useAsyncHandler();

  const loadUsers = () =>
    run(async () => {
      const res = await getPotentialMatches();
      if (res.success && res.data) {
        setPotentialMatches(res.data);
        setCurrentIndex(0);
      }
      return res;
    });

  const like = () =>
    run(async () => {
      const user = potentialMatches[currentIndex];
      if (!user) return;

      await passUser(user.id);
      const res = await likeUser(user.id);

      if (res.isMatch) {
        setMatchedUser(res.data!);
        setShowMatchNotification(true);
      }

      setCurrentIndex((i) => i + 1);
      return res;
    });

  const pass = () =>
    run(async () => {
      const user = potentialMatches[currentIndex];
      if (!user) return;

      const res = await passUser(user.id);
      if (res.success) setCurrentIndex((i) => i + 1);
      return res;
    });

  const reset = () =>
    run(async () => {
      const res = await resetPasses();
      if (!res.success) return res;

      return await loadUsers();
    });

  return {
    loading,
    message,
    type,
    potentialMatches,
    currentIndex,
    matchedUser,
    showMatchNotification,
    setMatchedUser,
    setShowMatchNotification,
    loadUsers,
    like,
    pass,
    reset,
  };
}
