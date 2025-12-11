import { AuthProvider, useAuth } from "@/lib/providers/auth-provider";
import { GlobalLoadingProvider } from "@/lib/providers/global-loading";
import { Redirect, Slot, useSegments } from "expo-router";
import "./global.css";

const InitialLayout = () => {
  const { user, initialized } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  // 🚨 Prevent redirects until auth state is known
  if (!initialized) {
    return null;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/" />;
  } else if (!user && !inAuthGroup) {
    return <Redirect href="/sign-in" />;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <GlobalLoadingProvider>
        <InitialLayout />
      </GlobalLoadingProvider>
    </AuthProvider>
  );
}
