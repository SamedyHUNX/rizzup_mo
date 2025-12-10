import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Discover() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-rubik-bold">Discover Screen</Text>
      </View>
    </SafeAreaView>
  );
}
