import { useAuth } from "@/lib/providers/auth-provider";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, signIn, error: signInError, user } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  useEffect(() => {
    if (signInError) {
      Alert.alert("Error", signInError);
    }
  }, [signInError]);

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image/Logo */}
        <View className="items-center pt-12 pb-8">
          <View className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 items-center justify-center mb-6">
            <Text className="text-6xl">💕</Text>
          </View>
        </View>

        {/* Welcome Text */}
        <View className="px-8 mb-8">
          <Text className="text-xs text-center uppercase tracking-widest text-gray-500 font-medium mb-3">
            Welcome to RizzUp
          </Text>

          <Text className="text-3xl font-bold text-gray-800 text-center leading-tight">
            Let's Get You Closer to{"\n"}
            <Text className="text-pink-500">Your Ideal Love</Text>
          </Text>
        </View>

        {/* Sign In Section */}
        <View className="px-8">
          <Text className="text-base text-center text-gray-600 font-medium mb-4">
            Sign in to RizzUp
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <TextInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-pink-500 rounded-full py-4 items-center justify-center mb-8 shadow-md"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Sign In</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          {/* <TouchableOpacity className="items-center mb-4" activeOpacity={0.7}>
            <Text className="text-sm text-gray-600">Forgot password?</Text>
          </TouchableOpacity> */}

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-sm text-gray-600">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Link
                href={"/sign-up"}
                className="text-sm text-pink-500 font-semibold"
              >
                Sign up
              </Link>
            </TouchableOpacity>
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-white border-2 border-gray-200 rounded-full py-4 flex-row items-center justify-center mb-6 shadow-sm"
            activeOpacity={0.7}
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png",
              }}
              className="w-6 h-6 mr-3"
              resizeMode="contain"
            />
            <Text className="text-gray-700 font-semibold text-base">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-xs text-center text-gray-500 px-4 mb-8">
            By continuing, you agree to RizzUp's{" "}
            <Text className="underline">Terms of Service</Text> and{" "}
            <Text className="underline">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
