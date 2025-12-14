import Loading from "@/components/loading";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useProfileFlow } from "@/lib/hooks/use-profile-flow";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {
  const {
    loadProfile,
    loading,
    message,
    type,
    refreshing,
    profile,
    refresh,
    signOut,
  } = useProfileFlow();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!message) return;

    if (type === "error") {
      Alert.alert("Error", message);
    }
  }, [message, type]);

  const handleEditProfile = () => {
    // Navigate to Edit Profile Screen
    router.push("/profile/edit");
  };

  if (loading) {
    return <Loading message="Loading your profile..." />;
  }

  if ((type === "error" && message) || !profile) {
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
            {message || "Unable to load your profile. Please try again."}
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

  const handleSignOut = () => {
    signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#ec4899"]}
          />
        }
      >
        <View className="px-4 pt-6 pb-8">
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </Text>
            <Text className="text-gray-600">
              Manage your profile and preferences
            </Text>
          </View>

          {/* Main Profile Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-4">
            {/* Profile Header */}
            <View className="flex-row items-center mb-6">
              <View className="relative mr-5">
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
                <Text className="text-gray-600 mb-1">@{profile.username}</Text>
                <Text className="text-sm text-gray-500">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* About Me */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
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
              <View className="flex-row gap-3">
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Gender
                  </Text>
                  <Text className="text-gray-900 font-semibold capitalize">
                    {profile.gender}
                  </Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-xl p-4">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Birthday
                  </Text>
                  <Text className="text-gray-900 font-semibold">
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
              <View className="flex-row gap-3">
                <View className="flex-1 bg-pink-50 rounded-xl p-4">
                  <Text className="text-sm font-medium text-pink-600 mb-1">
                    Age Range
                  </Text>
                  <Text className="text-gray-900 font-semibold">
                    {profile.preferences.age_range.min} -{" "}
                    {profile.preferences.age_range.max} years
                  </Text>
                </View>
                <View className="flex-1 bg-pink-50 rounded-xl p-4">
                  <Text className="text-sm font-medium text-pink-600 mb-1">
                    Distance
                  </Text>
                  <Text className="text-gray-900 font-semibold">
                    Up to {profile.preferences.distance} km
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>
            <TouchableOpacity
              onPress={handleEditProfile}
              className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50 active:bg-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-pink-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-lg">✏️</Text>
                </View>
                <Text className="text-gray-900 font-medium">Edit Profile</Text>
              </View>
              <Text className="text-gray-400 text-2xl">›</Text>
            </TouchableOpacity>
          </View>

          {/* Account Card */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Account
            </Text>
            <View className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50">
              <Text className="text-gray-600 font-medium">Username</Text>
              <Text className="text-gray-900 font-semibold">
                @{profile.username}
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="w-full rounded-xl overflow-hidden active:opacity-80"
          >
            <LinearGradient
              colors={["#ef4444", "#dc2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 px-2 flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-base text-center py-2">
                Sign Out
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
