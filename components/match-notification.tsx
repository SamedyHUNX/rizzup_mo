
import { UserProfile } from "@/types/users.type";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";

export function MatchNotification({
  match,
  onClose,
  onStartChat,
}: {
  match: UserProfile;
  onClose: () => void;
  onStartChat: () => void;
}) {
  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center">
      <View className="bg-white rounded-3xl p-8 mx-8 max-w-sm">
        <Text className="text-3xl text-center mb-4">🎉</Text>
        <Text className="text-2xl font-rubik-bold text-center mb-2">
          It's a Match!
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          You and {match.full_name} liked each other
        </Text>

        <TouchableOpacity
          onPress={onStartChat}
          className="mb-3 overflow-hidden rounded-full"
        >
          <LinearGradient colors={["#ec4899", "#ef4444"]} className="py-3 px-6">
            <Text className="text-white font-rubik-semibold text-center">
              Start Chat
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} className="py-3">
          <Text className="text-gray-600 text-center font-rubik-medium">
            Keep Swiping
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
