import Loading from "@/components/loading";
import { formatTime } from "@/lib/helpers/format-time";
import { getUserMatches } from "@/lib/supabase/matches";
import { UserProfile } from "@/types/users.type";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ChatData {
  id: string;
  user: UserProfile;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesScreen() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadMatches() {
      try {
        setError("");
        const { data: userMatches } = await getUserMatches();
        const chatData: ChatData[] = userMatches!.map((match) => ({
          id: match.id,
          user: match,
          lastMessage: "Start your conversation!",
          lastMessageTime: match.created_at,
          unreadCount: 0,
        }));
        setChats(chatData);
      } catch (error: any) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  if (loading) {
    return <Loading message="Loading your messages..." />;
  }

  const renderEmptyState = () => (
    <View className="items-center px-8 py-12">
      <View className="w-24 h-24 bg-purple-500 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">💬</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        No conversations yet
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mb-6 text-center">
        Start swiping to find matches and begin conversations!
      </Text>
      <Link href="/matches" asChild>
        <TouchableOpacity
          className="bg-pink-500 py-3 px-6 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-center">
            Start Swiping
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );

  const renderChatItem = ({ item: chat }: { item: ChatData }) => (
    <Link href={`/chat/${chat.id}`} asChild>
      <TouchableOpacity
        className="flex-row items-center p-6 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
        activeOpacity={0.7}
      >
        <View className="relative w-16 h-16 rounded-full overflow-hidden">
          <Image
            source={{ uri: chat.user.avatar_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {chat.unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {chat.unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-4 min-w-0">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-lg font-semibold text-gray-900 dark:text-white flex-1"
              numberOfLines={1}
            >
              {chat.user.full_name}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {formatTime(chat.lastMessageTime)}
            </Text>
          </View>

          <Text
            className="text-sm text-gray-600 dark:text-gray-400"
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <View className="flex-1 px-4 py-8">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Messages
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {chats.length} conversation{chats.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {chats.length === 0 ? (
          renderEmptyState()
        ) : (
          <View className="flex-1 max-w-2xl w-full mx-auto">
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex-1">
              <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
