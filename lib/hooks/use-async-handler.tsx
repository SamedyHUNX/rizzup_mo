import { useState } from "react";
import { isApiResponse } from "../guards/type-guard";

export function useAsyncHandler() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>("");
  const [type, setType] = useState<"success" | "error" | "">("");

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      setLoading(true);
      setMessage("");
      setType("");

      const result = await fn();

      if (isApiResponse(result)) {
        if (!result.success) {
          setMessage(result.message || "Something went wrong");
          setType("error");
        } else {
          setMessage(result.message || "");
          setType("success");
        }
      }

      return result;
    } catch (err: any) {
      setMessage(err.message);
      setType("error");
    } finally {
      setLoading(false);
    }
  }

  return { loading, message, type, run, setMessage, setType };
}
