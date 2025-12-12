import Loading from "@/components/loading";
import { ReactNode } from "react";
import { View } from "react-native";
import { useAuth } from "./auth-provider";

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth();

  return (
    <>
      {children}

      {authLoading && (
        <View className="absolute inset-0 z-50">
          <Loading />
        </View>
      )}
    </>
  );
}
