"use client";

import { useState } from "react";

export function useAsyncHandler() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function withAsync<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      setLoading(true);
      setError("");
      return await fn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, withAsync, setError };
}
