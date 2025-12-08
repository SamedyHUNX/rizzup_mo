import { signIn } from "@/lib/auth";
import { useAuth } from "@/lib/auth-provider";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInPage() {
  const { refetch, loading: authLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      <Redirect href={"/"} />;
    }
  }, [isLoggedIn, authLoading]);

  const handleLogin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      await signIn({ email, password });
      await refetch();
      Alert.alert("Signed in successfully!");
    } catch (error: any) {
      Alert.alert(error.message);
      console.error("Error during sign-in:", error);
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="h-full">
        <Image
          source={{
            uri: "data:image/jpeg;base64,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",
          }}
          className="w-full h-4/6"
          resizeMode="contain"
        />
        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome to RizzUp
          </Text>
          <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let's Get You Closer to {"\n"}
            <Text className="text-primary-300">Your Ideal Love</Text>
          </Text>
          <Text className="text-lg font-rubik text-black-200 text-center mt-12">
            Login to RizzUp with Google
          </Text>

          {/* <TouchableOpacity
            onPress={handleLogin}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
