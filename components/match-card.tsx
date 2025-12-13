import { calculateAge } from "@/lib/helpers/calculate-age";
import { UserProfile } from "@/types/users.type";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Image, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function MatchCard({ user }: { user: UserProfile }) {
  const cardHeight = height * 0.65;

  return (
    <View className="w-full max-w-full mx-auto">
      <View
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{
          height: cardHeight,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <View className="relative w-full h-full">
          {/* Image */}
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              className="w-full h-full"
              style={{ resizeMode: "cover" }}
            />
          ) : (
            // Fallback when no avatar
            <View className="w-full h-full bg-gray-300 items-center justify-center">
              <Text className="text-6xl text-gray-500">
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            locations={[0.3, 1]}
            className="absolute inset-0"
          />

          {/* User Info */}
          <View className="absolute bottom-0 left-0 right-0 p-6">
            <View className="flex-row items-end justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-rubik-bold text-white mb-1">
                  {user.full_name}, {calculateAge(user.birthdate)}
                </Text>
                <Text className="text-sm text-white opacity-90 mb-2">
                  @{user.username}
                </Text>
                {user.bio && (
                  <Text
                    className="text-sm text-white leading-relaxed"
                    numberOfLines={3}
                  >
                    {user.bio}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
