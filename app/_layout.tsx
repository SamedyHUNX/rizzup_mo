import { AuthProvider, useAuth } from "@/lib/providers/auth-provider";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "./global.css";

const InitialLayout = () => {
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    // Check if the path/url is in the (auth) group
    const inAuthGroup = segments[0] === "(auth)";

    if (user && !inAuthGroup) {
      router.replace("/");
    } else if (!user) {
      router.replace("/sign-in");
    }
  }, [user, initialized]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
