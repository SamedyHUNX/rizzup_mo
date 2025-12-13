import { calculateAge } from "@/lib/helpers/calculate-age";
import { UserProfile } from "@/types/users.type";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ChatHeaderProps {
  user: UserProfile | null;
  onVideoCall: () => void;
}

export default function ChatHeader({ user, onVideoCall }: ChatHeaderProps) {
  if (!user) {
    return;
  }

  return (
    <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700"
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19l-7-7 7-7"
                stroke="#6B7280"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <View className="flex-row items-center ml-4">
            <View className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
              <Image
                source={{ uri: user.avatar_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </View>

            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name}, {calculateAge(user.birthdate)}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onVideoCall}
            className="p-3 rounded-full bg-purple-500 active:bg-purple-600 shadow-lg"
            activeOpacity={0.8}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
