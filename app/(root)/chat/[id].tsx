import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ChatDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Chat ID: {id}</Text>
    </View>
  );
}
