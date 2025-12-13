import Loading from "@/components/loading";
import { useProfileUpdateFlow } from "@/lib/hooks/use-update-profile-flow";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function EditProfileScreen() {
  const {
    loadProfile,
    formSubmit,
    inputChange,
    dateChange,
    dateConfirm,
    dateCancel,
    loading,
    message,
    type,
    saving,
    showDatePicker,
    formData,
    setShowDatePicker,
    tempDate,
  } = useProfileUpdateFlow();

  useEffect(() => {
    loadProfile();
  }, []);

  function handlePhotoUpload() {
    // Implement photo picker logic here
    // You can use react-native-image-picker or expo-image-picker
    console.log("Open photo picker");
  }

  useEffect(() => {
    if (!message) return;

    if (type === "error") {
      Alert.alert("Error", message);
    } else if (type === "success") {
      Toast.show({ type: "success", text1: "Success", text2: message });
    }
  }, [message, type]);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView className="flex-1">
        <View className="px-4 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Edit Profile
            </Text>
            <Text className="text-base text-gray-600">
              Update your profile information
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-white rounded-3xl shadow-sm p-6">
            {/* Profile Picture */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Profile Picture
              </Text>
              <View className="flex-row items-center">
                <View className="relative mr-5">
                  <Image
                    source={{
                      uri:
                        formData.avatar_url ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-24 h-24 rounded-full bg-gray-200"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-pink-500 items-center justify-center shadow-md"
                    onPress={handlePhotoUpload}
                    activeOpacity={0.7}
                  >
                    <Text className="text-lg">📷</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">
                    Upload a new profile picture
                  </Text>
                  <Text className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max 5MB.
                  </Text>
                </View>
              </View>
            </View>

            {/* Full Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                value={formData.full_name}
                onChangeText={(value) => inputChange("full_name", value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Username */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Username *
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                value={formData.username}
                onChangeText={(value) => inputChange("username", value)}
                placeholder="Choose a username"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>

            {/* Gender */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </Text>
              <View className="border border-gray-300 rounded-xl overflow-hidden bg-white">
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => inputChange("gender", value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Non-binary" value="non-binary" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            {/* Birthday */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Birthday *
              </Text>
              <TouchableOpacity
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base ${
                    formData.birthdate ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {formData.birthdate
                    ? new Date(formData.birthdate).toLocaleDateString()
                    : "Select your birthday"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={
                    formData.birthdate
                      ? new Date(formData.birthdate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={dateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Bio */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                About Me *
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                value={formData.bio}
                onChangeText={(value) => inputChange("bio", value)}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                style={{ height: 100 }}
              />
              <Text className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row items-center justify-between pt-4 border-t border-gray-200 mt-2">
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                activeOpacity={0.7}
              >
                <Text className="px-6 py-3 text-gray-600 text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-8 py-3 rounded-xl ${
                  saving ? "bg-gray-400" : "bg-pink-500"
                }`}
                onPress={formSubmit}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              {/* Header with buttons */}
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={dateCancel} activeOpacity={0.7}>
                  <Text className="text-pink-500 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="text-gray-900 font-semibold text-base">
                  Select Birthday
                </Text>
                <TouchableOpacity onPress={dateConfirm} activeOpacity={0.7}>
                  <Text className="text-pink-500 font-semibold text-base">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={dateChange}
                maximumDate={new Date()}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
