import Loading from "@/components/loading";
import { MatchButtons } from "@/components/match-buttons";
import MatchCard from "@/components/match-card";
import { MatchNotification } from "@/components/match-notification";
import {
  getPotentialMatches,
  likeUser,
  UserProfile,
} from "@/lib/supabase/queries";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Discover() {
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      try {
        const potentialMatchesData = await getPotentialMatches();
        setPotentialMatches(potentialMatchesData);
      } catch (error: any) {
        Alert.alert("Error", error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleLike() {
    if (currentIndex < potentialMatches.length) {
      const likedUser = potentialMatches[currentIndex];

      try {
        const result = await likeUser(likedUser.id);

        if (result.isMatch) {
          setMatchedUser(result.matchedUser!);
          setShowMatchNotification(true);
        }

        setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handlePass() {
    if (currentIndex < potentialMatches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  const handleCloseMatchNotification = () => {
    setShowMatchNotification(false);
    setMatchedUser(null);
  };

  const handleStartChat = () => {
    // Navigate to chat
    handleCloseMatchNotification();
  };

  if (loading) {
    return <Loading message="Loading potential matches..." />;
  }

  if (currentIndex >= potentialMatches.length) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-8">
        <View className="items-center max-w-md">
          <LinearGradient
            colors={["#ec4899", "#ef4444"]}
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
          >
            <Text className="text-4xl">💕</Text>
          </LinearGradient>

          <Text className="text-2xl font-rubik-bold text-gray-900 mb-4 text-center">
            No more profiles to show
          </Text>

          <Text className="text-gray-600 mb-6 text-center text-base">
            Check back later for new matches, or try adjusting your preferences!
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentIndex(0)}
            className="overflow-hidden rounded-full"
          >
            <LinearGradient
              colors={["#ec4899", "#ef4444"]}
              className="py-3 px-6"
            >
              <Text className="text-white font-rubik-semibold text-base">
                Refresh
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={() => setCurrentIndex((prev) => prev + 1)}>
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
        {/* Header */}
        <View className="mb-8">
          {/* Header Row */}
          <View className="flex-row items-center justify-between mb-4">
            {/* Left: Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white/20 active:bg-white/30"
            >
              <Icon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            {/* Middle: Title */}
            <Text className="text-3xl font-rubik-bold text-gray-900 mb-2 text-center flex-1">
              Discover Matches
            </Text>

            {/* Right: Spacer (keeps title centered) */}
            <View style={{ width: 40 }} />
          </View>

          {/* Subtext */}
          <View className="items-center">
            <Text className="text-gray-600 text-base">
              {currentIndex + 1} of {potentialMatches.length} profiles
            </Text>
          </View>
        </View>

        {/* Match Card */}
        <View className="max-w-md mx-auto w-full">
          <MatchCard user={currentPotentialMatch} />

          <View className="mt-8">
            <MatchButtons onLike={handleLike} onPass={handlePass} />
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
