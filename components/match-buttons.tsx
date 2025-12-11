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
    <View className="flex-row justify-center items-center gap-6 py-4">
      {/* Pass Button */}
      <TouchableOpacity
        onPress={onPass}
        className="w-16 h-16 rounded-full bg-white items-center justify-center active:scale-90"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="w-full h-full rounded-full border border-gray-100 items-center justify-center">
          <Icon name="close" size={28} color="#ef4444" />
        </View>
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        onPress={onLike}
        className="w-16 h-16 rounded-full bg-white items-center justify-center active:scale-90"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="w-full h-full rounded-full border border-gray-100 items-center justify-center">
          <Icon name="favorite" size={28} color="#4ade80" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
