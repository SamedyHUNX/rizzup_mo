import ChatHeader from "@/components/chat-header";
import Loading from "@/components/loading";
import StreamChatInterface from "@/components/stream-chat-interface";
import { useAuth } from "@/lib/providers/auth-provider";
import { getUserMatches } from "@/lib/supabase/matches";
import { UserProfile } from "@/types/users.type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessageChatDetail() {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { id } = useLocalSearchParams();

  const { user } = useAuth();

  const userId = id as string;

  const chatInterfaceRef = useRef<{ handleVideoCall: () => void } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        setError("");
        const { data } = await getUserMatches();
        if (!data) {
          return null;
        }
        const matchedUser = data.find((match) => match.id === userId);

        if (matchedUser) {
          setOtherUser(matchedUser);
        } else {
          router.push("/chat");
        }
      } catch (error: any) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadUserData();
    }
  }, [userId, router, user]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  if (loading) {
    return <Loading message="Loading your matches..." />;
  }

  if (!otherUser) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <View className="flex-1 items-center justify-center px-8">
          <View className="items-center max-w-md">
            <View className="w-24 h-24 bg-pink-500 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">❌</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              User not found
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              The user you're looking for doesn't exist or you don't have
              permission to chat with them.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/chat")}
              className="bg-pink-500 py-3 px-6 rounded-full"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center">
                Back to Messages
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <View className="flex-1">
        <ChatHeader
          user={otherUser}
          onVideoCall={() => {
            chatInterfaceRef.current?.handleVideoCall();
          }}
        />

        <View className="flex-1">
          <StreamChatInterface otherUser={otherUser} ref={chatInterfaceRef} />
        </View>
      </View>
    </SafeAreaView>
  );
}
