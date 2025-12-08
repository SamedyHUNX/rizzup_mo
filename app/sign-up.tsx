import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // Sign up logic here
      console.log({
        fullName,
        username,
        email,
        password,
        gender,
        birthdate,
        avatarUrl,
        preferences,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator className="text-gray-500 text-base" />
      </SafeAreaView>
    );
  }

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
            Create Your Account &{"\n"}
            <Text className="text-pink-500">Find Your Match</Text>
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="px-8 mb-6">
          <View className="flex-row items-center justify-center">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`h-2 rounded-full mx-1 ${
                  s === step
                    ? "w-8 bg-pink-500"
                    : s < step
                      ? "w-2 bg-pink-300"
                      : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Sign Up Section */}
        <View className="px-8">
          {step === 1 && (
            <>
              <Text className="text-base text-center text-gray-600 font-medium mb-6">
                Basic Information
              </Text>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="px-4 text-sm text-gray-500">
                  or sign up with email
                </Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Full Name Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Username Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

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
              <View className="mb-4">
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <TextInput
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Next Button */}
              <TouchableOpacity
                onPress={handleNext}
                className="bg-pink-500 rounded-full py-4 items-center justify-center mb-4 shadow-md"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Next</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text className="text-base text-center text-gray-600 font-medium mb-6">
                Tell Us About Yourself
              </Text>

              {/* Gender Selection */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2 px-1">Gender</Text>
                <View className="flex-row flex-wrap">
                  {["Male", "Female", "Non-binary", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g.toLowerCase())}
                      className={`px-6 py-3 rounded-full mr-2 mb-2 border-2 ${
                        gender === g.toLowerCase()
                          ? "bg-pink-500 border-pink-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          gender === g.toLowerCase()
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Birthdate Input */}
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2 px-1">
                  Date of Birth
                </Text>
                <TextInput
                  placeholder="MM/DD/YYYY"
                  value={birthdate}
                  onChangeText={setBirthdate}
                  keyboardType="numbers-and-punctuation"
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Avatar URL Input */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-2 px-1">
                  Profile Picture URL (optional)
                </Text>
                <TextInput
                  placeholder="https://example.com/photo.jpg"
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Navigation Buttons */}
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={handleBack}
                  className="flex-1 bg-gray-100 rounded-full py-4 items-center justify-center mr-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 font-bold text-base">
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNext}
                  className="flex-1 bg-pink-500 rounded-full py-4 items-center justify-center ml-2 shadow-md"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">Next</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text className="text-base text-center text-gray-600 font-medium mb-6">
                Your Preferences
              </Text>

              {/* Preferences Selection */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-3 px-1">
                  What are you looking for?
                </Text>
                <View className="flex-row flex-wrap">
                  {["Men", "Women", "Everyone"].map((pref) => (
                    <TouchableOpacity
                      key={pref}
                      onPress={() => setPreferences(pref.toLowerCase())}
                      className={`px-8 py-4 rounded-full mr-2 mb-2 border-2 ${
                        preferences === pref.toLowerCase()
                          ? "bg-pink-500 border-pink-500"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-base font-medium ${
                          preferences === pref.toLowerCase()
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-xs text-gray-500 px-1 mt-2">
                  You can change this later in your settings
                </Text>
              </View>

              {/* Navigation Buttons */}
              <View className="flex-row mb-4">
                <TouchableOpacity
                  onPress={handleBack}
                  className="flex-1 bg-gray-100 rounded-full py-4 items-center justify-center mr-2"
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-700 font-bold text-base">
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSignUp}
                  className="flex-1 bg-pink-500 rounded-full py-4 items-center justify-center ml-2 shadow-md"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-sm text-gray-600">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Link
                href={"/sign-in"}
                className="text-sm text-pink-500 font-semibold"
              >
                Sign in
              </Link>
            </TouchableOpacity>
          </View>

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
