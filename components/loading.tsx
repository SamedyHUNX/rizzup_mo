import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Loading({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-4 text-gray-600">{message}</Text>
      </View>
    </SafeAreaView>
  );
}
