import Loading from "@/components/loading";
import { ReactNode } from "react";
import { useAuth } from "./auth-provider";

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  return (
    <>
      {loading && <Loading message="Loading..." />}
      {children}
    </>
  );
}
