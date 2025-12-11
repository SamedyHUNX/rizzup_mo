import Loading from "@/components/loading";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "@/lib/supabase/profile";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
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

export default function EditProfileScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    gender: "male",
    birthdate: "",
    avatar_url: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      // Replace with your actual API call
      const profileData = await getCurrentUserProfile();

      if (profileData) {
        setFormData({
          full_name: profileData.full_name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
          gender: profileData.gender || "male",
          birthdate: profileData.birthdate || "",
          avatar_url: profileData.avatar_url || "",
        });
      }
    } catch (error: any) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit() {
    setSaving(true);
    setError("");

    try {
      // Replace with your actual API call
      const result = await updateUserProfile(formData);

      if (result.success) {
        router.push("/profile");
      } else {
        setError(result.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(name: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePhotoUpload() {
    // Implement photo picker logic here
    // You can use react-native-image-picker or expo-image-picker
    console.log("Open photo picker");
  }

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
      <View className="px-4 py-8">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Edit Profile
          </Text>
          <Text className="text-gray-600">Update your profile information</Text>
        </View>

        <View className="max-w-2xl mx-auto w-full">
          <View className="bg-white rounded-2xl shadow-lg p-8">
            {/* Profile Picture */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-4">
                Profile Picture
              </Text>
              <View className="flex-row items-center space-x-6">
                <View className="relative">
                  <View className="w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      source={{
                        uri:
                          formData.avatar_url ||
                          "https://via.placeholder.com/150",
                      }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <TouchableOpacity
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 items-center justify-center"
                    onPress={handlePhotoUpload}
                  >
                    <Text className="text-white text-base">📷</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-2">
                    Upload a new profile picture
                  </Text>
                  <Text className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max 5MB.
                  </Text>
                </View>
              </View>
            </View>

            {/* Full Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </Text>
              <TextInput
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                value={formData.full_name}
                onChangeText={(value) => handleInputChange("full_name", value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Username */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Username *
              </Text>
              <TextInput
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                value={formData.username}
                onChangeText={(value) => handleInputChange("username", value)}
                placeholder="Choose a username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Gender *
              </Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Non-binary" value="non-binary" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            {/* Birthday */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Birthday *
              </Text>
              <TextInput
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                value={formData.birthdate}
                onChangeText={(value) => handleInputChange("birthdate", value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Format: YYYY-MM-DD (e.g., 1990-01-01)
              </Text>
            </View>

            {/* Bio */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                About Me *
              </Text>
              <TextInput
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 h-24"
                value={formData.bio}
                onChangeText={(value) => handleInputChange("bio", value)}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
                <Text className="text-red-700">{error}</Text>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row items-center justify-between pt-6 border-t border-gray-200">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="px-6 py-2 text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500  bg-green-400 ${
                  saving ? "opacity-50" : ""
                }`}
                onPress={handleFormSubmit}
                disabled={saving}
              >
                <Text className="text-black font-semibold">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
