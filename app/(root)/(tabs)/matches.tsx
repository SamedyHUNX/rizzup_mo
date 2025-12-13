import Loading from "@/components/loading";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useMatchedFlow } from "@/lib/hooks/use-matched-flow";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function MatchesListPage() {
  const { message, type, matches, loading, get } = useMatchedFlow();
  const router = useRouter();

  useEffect(() => {
    get();
  }, []);

  useEffect(() => {
    if (!message) return;

    if (type === "error") {
      Alert.alert("Error", message);
    } else if (type === "success") {
      Toast.show({ type: "success", text1: "Success", text2: message });
    }
  }, [message, type]);

  if (loading) {
    return <Loading message="Loading your matches..." />;
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 " contentContainerClassName="flex-grow">
        <View className="px-4 py-8">
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Your Matches
            </Text>
            <Text className="text-gray-600">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </Text>
          </View>

          {matches.length === 0 ? (
            <View className="items-center max-w-md self-center px-8 py-8">
              <View className="w-24 h-24 bg-pink-500 rounded-full justify-center items-center mb-6">
                <Text className="text-5xl">💕</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                No matches yet
              </Text>
              <Text className="text-gray-600 mb-6 text-center">
                Start swiping to find your perfect match!
              </Text>
              <TouchableOpacity
                className="bg-pink-500 py-3 px-6 rounded-full"
                onPress={() => router.push("/discover")}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  Start Swiping
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="max-w-2xl self-center w-full">
              {matches.map((match, key) => (
                <TouchableOpacity
                  key={key}
                  className="bg-white rounded-2xl p-6 mb-4 shadow-lg"
                  onPress={() => router.push({ pathname: "/chat", params: { userId: match.id } })}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <Image
                        source={{ uri: match.avatar_url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>

                    <View className="flex-1 min-w-0">
                      <Text className="text-lg font-semibold text-gray-900">
                        {match.full_name}, {calculateAge(match.birthdate)}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-1">
                        @{match.username}
                      </Text>
                      <Text className="text-sm text-gray-600" numberOfLines={2}>
                        {match.bio}
                      </Text>
                    </View>

                    <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
