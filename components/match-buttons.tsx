import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export function MatchButtons({
  onLike,
  onPass,
}: {
  onLike: () => void;
  onPass: () => void;
}) {
  return (
    <View className="flex-row justify-center items-center gap-6">
      {/* Pass Button */}
      <TouchableOpacity
        onPress={onPass}
        className="w-16 h-16 rounded-full bg-white shadow-lg items-center justify-center active:scale-95"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <Icon name="close" size={32} color="#ef4444" />
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        onPress={onLike}
        className="w-20 h-20 rounded-full items-center justify-center active:scale-95 overflow-hidden"
      >
        <LinearGradient
          colors={["#ec4899", "#ef4444"]}
          className="w-full h-full items-center justify-center"
        >
          <Icon name="favorite" size={36} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
