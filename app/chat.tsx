import ChatHeader from "@/components/chat-header";
import Loading from "@/components/loading";
import StreamChatInterface from "@/components/stream-chat-interface";
import { useMatchedFlow } from "@/lib/hooks/use-matched-flow";
import { useAuth } from "@/lib/providers/auth-provider";
import { UserProfile } from "@/types/users.type";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ChatDetail() {
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  const params = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAuth();
  const userId = params.userId as string;

  const chatInterfaceRef = useRef<{ handleVideoCall: () => void } | null>(null);

  const { get, loading, message, type, matches } = useMatchedFlow();

  useEffect(() => {
    if (user) {
      get();
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    if (matches.length === 0) {
      return;
    }

    const matchedUser = matches.find((match) => match.id === userId);
    if (matchedUser) {
      setOtherUser(matchedUser);
      setNotFound(false);
    } else {
      setNotFound(true);
      const timer = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/messages");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [matches, loading, userId]);

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

  if (notFound) {
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
              onPress={() => router.push("/messages")}
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

  if (!otherUser) {
    return null;
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
