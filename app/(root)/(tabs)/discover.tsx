import Loading from "@/components/loading";
import { MatchButtons } from "@/components/match-buttons";
import MatchCard from "@/components/match-card";
import { MatchNotification } from "@/components/match-notification";
import { useMatchFlow } from "@/lib/hooks/use-match-flow";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Discover() {
  const {
    loading,
    message,
    type,
    potentialMatches,
    currentIndex,
    matchedUser,
    showMatchNotification,
    setShowMatchNotification,
    setMatchedUser,
    like,
    pass,
    reset,
    loadUsers,
  } = useMatchFlow();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!message) return;

    if (type === "error") {
      Alert.alert("Error", message);
    } else if (type === "success") {
      Toast.show({ type: "success", text1: "Success", text2: message });
    }
  }, [message, type]);

  const handleCloseMatchNotification = () => {
    setShowMatchNotification(false);
    setMatchedUser(null);
  };

  const handleStartChat = handleCloseMatchNotification;

  if (loading) {
    return <Loading message="Loading potential matches..." />;
  }

  if (currentIndex >= potentialMatches.length) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6 ">
          <View className="items-center max-w-md w-full bg-white rounded-3xl p-8 shadow-lg">
            <View className="mb-6">
              <Text className="text-5xl">💕</Text>
            </View>

            <Text className="text-3xl font-rubik-bold text-gray-900 mb-3 text-center">
              That's Everyone!
            </Text>

            <Text className="text-gray-500 mb-8 text-center text-base leading-6 px-4">
              You've seen all available profiles. Check back soon for new
              matches or adjust your preferences to see more people.
            </Text>

            <TouchableOpacity
              onPress={reset}
              className="w-full overflow-hidden rounded-md shadow-md"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ec4899", "#ef4444"]}
                className="py-4 px-8"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-white font-rubik-bold text-center text-lg">
                  Start Over
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.navigate("/profile")}
              className="mt-4 py-3 px-6"
              activeOpacity={0.7}
            >
              <Text className="text-pink-500 font-rubik-semibold text-center text-base">
                Update Preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showMatchNotification && matchedUser && (
          <MatchNotification
            match={matchedUser}
            onClose={handleCloseMatchNotification}
            onStartChat={handleStartChat}
          />
        )}
      </SafeAreaView>
    );
  }

  const currentPotentialMatch = potentialMatches[currentIndex];

  if (!currentPotentialMatch) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-gray-600">No profile data available</Text>
        <TouchableOpacity onPress={pass}>
          <Text className="text-pink-500 mt-4">Skip →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 32 }}
      >
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white/20 active:bg-white/30"
            >
              <Icon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            <Text className="text-3xl font-rubik-bold text-gray-900 mb-2 text-center flex-1">
              Discover Matches
            </Text>

            <View style={{ width: 40 }} />
          </View>

          <View className="items-center">
            <Text className="text-gray-600 text-base">
              {currentIndex + 1} of {potentialMatches.length} profiles
            </Text>
          </View>
        </View>

        <View className="max-w-md mx-auto w-full">
          <MatchCard user={currentPotentialMatch} />

          <View className="mt-8 absolute left-0 bottom-[-50px] right-0">
            <MatchButtons onLike={like} onPass={pass} />
          </View>
        </View>

        {showMatchNotification && matchedUser && (
          <MatchNotification
            match={matchedUser}
            onClose={handleCloseMatchNotification}
            onStartChat={handleStartChat}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
