import { AuthProvider, useAuth } from "@/lib/providers/auth-provider";
import { GlobalLoadingProvider } from "@/lib/providers/global-loading";
import { Redirect, Stack, useSegments } from "expo-router";
import "./global.css";

const InitialLayout = () => {
  const { user, initialized } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  if (!initialized) return null;

  if (!user && !inAuthGroup) {
    return <Redirect href="/sign-in" />;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(root)" />
      <Stack.Screen name="chat" options={{ presentation: "card" }} />
      <Stack.Screen name="profile/edit" />
    </Stack>
  );
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
