import { calculateAge } from "@/lib/helpers/calculate-age";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { UserProfile } from "@/lib/supabase/queries";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      setError(null);
      const profileData = await getCurrentUserProfile();
      if (profileData) {
        setProfile(profileData);
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Error loading profile: ", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // navigation.navigate('EditProfile');
    console.log("Navigate to edit profile");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="mt-4 text-gray-600">Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">❌</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Profile not found
          </Text>
          <Text className="text-gray-600 mb-6 text-center">
            {error || "Unable to load your profile. Please try again."}
          </Text>
          <TouchableOpacity
            onPress={loadProfile}
            className="bg-gradient-to-r from-pink-500 to-red-500 py-3 px-6 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ec4899"]}
          />
        }
      >
        <View className="px-4 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </Text>
            <Text className="text-gray-600">
              Manage your profile and preferences
            </Text>
          </View>

          {/* Main Profile Card */}
          <View className="bg-white rounded-2xl shadow-lg p-8 mb-4">
            {/* Profile Header */}
            <View className="flex-row items-center mb-8">
              <View className="relative mr-6">
                <Image
                  source={{
                    uri: profile.avatar_url || "https://i.pravatar.cc/300",
                  }}
                  className="w-24 h-24 rounded-full"
                />
              </View>

              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.full_name}, {calculateAge(profile.birthdate)}
                </Text>
                <Text className="text-gray-600 mb-2">@{profile.username}</Text>
                <Text className="text-sm text-gray-500">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* About Me */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                About Me
              </Text>
              <Text className="text-gray-600 leading-relaxed">
                {profile.bio || "No bio added yet."}
              </Text>
            </View>

            {/* Basic Information */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Basic Information
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </Text>
                  <Text className="text-gray-900 capitalize">
                    {profile.gender}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Birthday
                  </Text>
                  <Text className="text-gray-900">
                    {new Date(profile.birthdate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Dating Preferences */}
            <View>
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Dating Preferences
              </Text>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </Text>
                  <Text className="text-gray-900">
                    {profile.preferences.age_range.min} -{" "}
                    {profile.preferences.age_range.max} years
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </Text>
                  <Text className="text-gray-900">
                    Up to {profile.preferences.distance} km
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions Card */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>
            <TouchableOpacity
              onPress={handleEditProfile}
              className="flex-row items-center justify-between p-3 rounded-lg active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white">✏️</Text>
                </View>
                <Text className="text-gray-900">Edit Profile</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          </View>

          {/* Account Card */}
          <View className="bg-white rounded-2xl shadow-lg p-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Account
            </Text>
            <View className="flex-row items-center justify-between p-3 rounded-lg bg-gray-50">
              <Text className="text-gray-900">Username</Text>
              <Text className="text-gray-500">@{profile.username}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
