import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectedImage {
  uri: string;
  type?: string;
}

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null
  );
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthdate: "",
    preferences: "",
    image: "",
  });

  // Real-time validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Must contain a lowercase letter";
    if (!/(?=.*\d)/.test(password)) return "Must contain a number";
    return "";
  };

  const validateConfirmPassword = (
    confirmPass: string,
    originalPass: string
  ) => {
    if (!confirmPass) return "Please confirm your password";
    if (confirmPass !== originalPass) return "Passwords don't match";
    return "";
  };

  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return "Only letters, numbers, and underscores allowed";
    return "";
  };

  const validateBirthdate = (date: string) => {
    if (!date) return "Date of birth is required";
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dateRegex.test(date)) return "Please use MM/DD/YYYY format";

    const [month, day, year] = date.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) return "You must be at least 18 years old";
    if (year < 1900 || year > today.getFullYear())
      return "Please enter a valid year";

    return "";
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          fullName.trim() &&
          username.trim() &&
          email.trim() &&
          password &&
          confirmPassword &&
          birthdate &&
          !errors.fullName &&
          !errors.username &&
          !errors.email &&
          !errors.password &&
          !errors.confirmPassword &&
          !errors.birthdate
        );
      case 2:
        return gender && preferences && selectedImage;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep(step + 1);
    } else {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSignUp = async () => {
    if (!isStepValid()) {
      Alert.alert("Validation Error", "Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      let uploadedAvatarUrl = "";

      if (selectedImage) {
        const fileExt = selectedImage.uri.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const response = await fetch(selectedImage.uri);
        const blob = await response.blob();

        // const { data: uploadData, error: uploadError } = await supabase.storage...

        uploadedAvatarUrl = "uploaded-url";
      }

      console.log({
        fullName,
        username,
        email,
        password,
        gender,
        birthdate,
        avatarUrl: uploadedAvatarUrl,
        preferences,
      });

      // TODO: Call your sign up function
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
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
        <View className="items-center pt-8">
          <View className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 items-center justify-center">
            <Text className="text-6xl">😂</Text>
          </View>
        </View>

        {step === 1 && (
          <View className="px-8 mb-4 mt-6">
            <Text className="text-xs text-center uppercase tracking-widest text-gray-500 font-medium mb-3">
              Welcome to RizzUp
            </Text>
            <Text className="text-3xl font-bold text-gray-800 text-center leading-tight">
              Create Your Account
            </Text>
          </View>
        )}

        {/* Progress Indicator */}
        <View className="px-8 mb-6 mt-6">
          <View className="flex-row items-center justify-center">
            {[1, 2].map((s) => (
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

              {/* Full Name Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Full name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setErrors({ ...errors, fullName: validateFullName(text) });
                  }}
                  autoCapitalize="words"
                  className={`bg-gray-50 border-2 ${
                    errors.fullName ? "border-red-400" : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.fullName ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.fullName}
                  </Text>
                ) : null}
              </View>

              {/* Username Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Username"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrors({ ...errors, username: validateUsername(text) });
                  }}
                  autoCapitalize="none"
                  className={`bg-gray-50 border-2 ${
                    errors.username ? "border-red-400" : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.username ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.username}
                  </Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: validateEmail(text) });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`bg-gray-50 border-2 ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.email ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({
                      ...errors,
                      password: validatePassword(text),
                      confirmPassword: confirmPassword
                        ? validateConfirmPassword(confirmPassword, text)
                        : "",
                    });
                  }}
                  secureTextEntry
                  className={`bg-gray-50 border-2 ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.password ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View className="mb-4">
                <TextInput
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors({
                      ...errors,
                      confirmPassword: validateConfirmPassword(text, password),
                    });
                  }}
                  secureTextEntry
                  className={`bg-gray-50 border-2 ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.confirmPassword ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>

              {/* Birthdate Input */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-2 px-1">
                  Date of Birth
                </Text>
                <TextInput
                  placeholder="MM/DD/YYYY"
                  value={birthdate}
                  onChangeText={(text) => {
                    setBirthdate(text);
                    setErrors({
                      ...errors,
                      birthdate: validateBirthdate(text),
                    });
                  }}
                  keyboardType="numbers-and-punctuation"
                  className={`bg-gray-50 border-2 ${
                    errors.birthdate ? "border-red-400" : "border-gray-200"
                  } rounded-2xl px-4 py-4 text-base text-gray-800`}
                  placeholderTextColor="#9CA3AF"
                  maxLength={10}
                />
                {errors.birthdate ? (
                  <Text className="text-red-500 text-xs mt-1 px-2">
                    {errors.birthdate}
                  </Text>
                ) : null}
              </View>

              {/* Next Button */}
              <TouchableOpacity
                onPress={handleNext}
                className={`rounded-full py-4 items-center justify-center mb-4 shadow-md ${
                  isStepValid() ? "bg-pink-500" : "bg-gray-300"
                }`}
                activeOpacity={0.8}
                disabled={!isStepValid()}
              >
                <Text
                  className={`font-bold text-base ${
                    isStepValid() ? "text-white" : "text-gray-500"
                  }`}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text className="text-base text-center text-gray-600 font-medium mb-6">
                Complete Your Profile
              </Text>

              {/* Profile Photo - Required */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-3 px-1">
                  Profile Picture <Text className="text-pink-500">*</Text>
                </Text>

                {/* Square Image Preview */}
                <View className="items-center mb-4">
                  {selectedImage ? (
                    <View className="relative">
                      <Image
                        source={{ uri: selectedImage.uri }}
                        className="w-80 h-80 rounded-2xl"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-pink-500 rounded-full w-8 h-8 items-center justify-center shadow-lg"
                        activeOpacity={0.7}
                      >
                        <Text className="text-white font-bold text-lg">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="w-40 h-40 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center">
                      <Text className="text-4xl">📷</Text>
                    </View>
                  )}
                </View>

                {/* Upload Buttons */}
                <View className="flex-row mb-4">
                  <TouchableOpacity
                    onPress={pickImage}
                    className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 items-center justify-center mr-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-medium text-sm">
                      📷 Choose Photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takePhoto}
                    className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 items-center justify-center ml-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-medium text-sm">
                      📸 Take Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gender Selection */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-3 px-1">
                  Gender <Text className="text-pink-500">*</Text>
                </Text>
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

              {/* Preferences Selection */}
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-3 px-1">
                  What are you looking for?{" "}
                  <Text className="text-pink-500">*</Text>
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
              <View className="flex-row mb-16">
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
                  className={`flex-1 rounded-full py-4 items-center justify-center ml-2 shadow-md ${
                    isStepValid() ? "bg-pink-500" : "bg-gray-300"
                  }`}
                  activeOpacity={0.8}
                  disabled={!isStepValid()}
                >
                  <Text
                    className={`font-bold text-base ${
                      isStepValid() ? "text-white" : "text-gray-500"
                    }`}
                  >
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
