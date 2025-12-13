import { UserProfile } from "@/types/users.type";
import { useRouter } from "expo-router";
import React, {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Channel, Event, StreamChat } from "stream-chat";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
  user_id: string;
}

interface StreamChatInterfaceProps {
  otherUser: UserProfile;
  ref: RefObject<{ handleVideoCall: () => void } | null>;
}

export default function StreamChatInterface({
  otherUser,
  ref,
}: StreamChatInterfaceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);

  const [videoCallId, setVideoCallId] = useState<string>("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);

  const [incomingCallId, setIncomingCallId] = useState<string>("");
  const [callerName, setCallerName] = useState<string>("");
  const [showIncomingCall, setIncomingCall] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  function scrollToBottom() {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setShowVideoCall(false);
    setVideoCallId("");
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
    setIsCallInitiator(false);

    async function initializeChat() {
      try {
        setError(null);

        const { token, userId, userName, userImage } =
          await getStreamUserToken();
        setCurrentUserId(userId!);

        const chatClient = StreamChat.getInstance(
          process.env.EXPO_PUBLIC_STREAM_API_KEY!
        );

        await chatClient.connectUser(
          {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token
        );

        const { channelType, channelId } = await createOrGetChannel(
          otherUser.id
        );

        const chatChannel = chatClient.channel(channelType!, channelId);
        await chatChannel.watch();

        const state = await chatChannel.query({ messages: { limit: 50 } });

        const convertedMessages: Message[] = state.messages.map((msg) => ({
          id: msg.id,
          text: msg.text || "",
          sender: msg.user?.id === userId ? "me" : "other",
          timestamp: new Date(msg.created_at || new Date()),
          user_id: msg.user?.id || "",
        }));

        setMessages(convertedMessages);

        chatChannel.on("message.new", (event: Event) => {
          if (event.message) {
            if (event.message.text?.includes(`📹 Video call invitation`)) {
              const customData = event.message as any;

              if (customData.caller_id !== userId) {
                setIncomingCallId(customData.call_id);
                setCallerName(customData.caller_name || "Someone");
                setIncomingCall(true);
              }
              return;
            }

            if (event.message.user?.id !== userId) {
              const newMsg: Message = {
                id: event.message.id,
                text: event.message.text || "",
                sender: "other",
                timestamp: new Date(event.message.created_at || new Date()),
                user_id: event.message.user?.id || "",
              };

              setMessages((prev) => {
                const messageExists = prev.some((msg) => msg.id === newMsg.id);
                if (!messageExists) {
                  return [...prev, newMsg];
                }
                return prev;
              });
            }
          }
        });

        chatChannel.on("typing.start", (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(true);
          }
        });

        chatChannel.on("typing.stop", (event: Event) => {
          if (event.user?.id !== userId) {
            setIsTyping(false);
          }
        });

        setClient(chatClient);
        setChannel(chatChannel);
      } catch (error) {
        router.push("/chat");
      } finally {
        setLoading(false);
      }
    }

    if (otherUser) {
      initializeChat();
    }

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [otherUser]);

  async function handleVideoCall() {
    try {
      const { callId } = await createVideoCall(otherUser.id);
      setVideoCallId(callId!);
      setShowVideoCall(true);
      setIsCallInitiator(true);

      if (channel) {
        const messageData = {
          text: `📹 Video call invitation`,
          call_id: callId,
          caller_id: currentUserId,
          caller_name: otherUser.full_name || "Someone",
        };

        await channel.sendMessage(messageData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useImperativeHandle(ref, () => ({
    handleVideoCall,
  }));

  async function handleSendMessage() {
    if (newMessage.trim() && channel) {
      try {
        const response = await channel.sendMessage({
          text: newMessage.trim(),
        });

        const message: Message = {
          id: response.message.id,
          text: newMessage.trim(),
          sender: "me",
          timestamp: new Date(),
          user_id: currentUserId,
        };

        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (!messageExists) {
            return [...prev, message];
          }
          return prev;
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  }

  function handleCallEnd() {
    setShowVideoCall(false);
    setVideoCallId("");
    setIsCallInitiator(false);
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
  }

  function handleDeclineCall() {
    setIncomingCall(false);
    setIncomingCallId("");
    setCallerName("");
  }

  function handleAcceptCall() {
    setVideoCallId(incomingCallId);
    setShowVideoCall(true);
    setIncomingCall(false);
    setIncomingCallId("");
    setIsCallInitiator(false);
  }

  function formatTime(date: Date) {
    return date.toLocaleDateString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (!client || !channel) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <View className="items-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">
            Setting up chat...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerClassName="py-4"
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, key) => (
          <View
            key={key}
            className={`mb-4 ${
              message.sender === "me" ? "items-end" : "items-start"
            }`}
          >
            <View
              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                message.sender === "me"
                  ? "bg-pink-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Text
                className={`text-sm ${
                  message.sender === "me"
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {message.text}
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  message.sender === "me"
                    ? "text-pink-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View className="items-start mb-4">
            <View className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-2xl">
              <View className="flex-row space-x-1">
                <View className="w-2 h-2 bg-gray-400 rounded-full" />
                <View className="w-2 h-2 bg-gray-400 rounded-full" />
                <View className="w-2 h-2 bg-gray-400 rounded-full" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      <View className="border-t border-gray-200 dark:border-gray-700 p-4">
        <View className="flex-row items-center space-x-2">
          <TextInput
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              if (channel && text.length > 0) {
                channel.keystroke();
              }
            }}
            onFocus={() => {
              if (channel) {
                channel.keystroke();
              }
            }}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full dark:bg-gray-800 dark:text-white"
            editable={!!channel}
            multiline={false}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || !channel}
            className={`px-6 py-2 bg-pink-500 rounded-full ${
              !newMessage.trim() || !channel ? "opacity-50" : ""
            }`}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14m-7-7l7 7-7 7"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Incoming Call Modal */}
      <Modal
        visible={showIncomingCall}
        transparent
        animationType="fade"
        onRequestClose={handleDeclineCall}
      >
        <View className="flex-1 bg-black/75 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-4 max-w-sm w-full">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-pink-500">
                <Image
                  source={{ uri: otherUser.avatar_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Incoming Video Call
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mb-6">
                {callerName} is calling you
              </Text>
              <View className="flex-row w-full space-x-4">
                <TouchableOpacity
                  onPress={handleDeclineCall}
                  className="flex-1 bg-red-500 py-3 px-6 rounded-full items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold">Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAcceptCall}
                  className="flex-1 bg-green-500 py-3 px-6 rounded-full items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Call Component */}
      {showVideoCall && videoCallId && (
        <VideoCall
          onCallEnd={handleCallEnd}
          callId={videoCallId}
          isIncoming={!isCallInitiator}
        />
      )}
    </KeyboardAvoidingView>
  );
}

// Note: You'll need to implement these helper functions
declare function getStreamUserToken(): Promise<{
  token: string;
  userId: string;
  userName: string;
  userImage: string;
}>;

declare function createOrGetChannel(otherUserId: string): Promise<{
  channelType: string;
  channelId: string;
}>;

declare function createVideoCall(otherUserId: string): Promise<{
  callId: string;
}>;

// Video Call component placeholder
declare const VideoCall: React.FC<{
  onCallEnd: () => void;
  callId: string;
  isIncoming: boolean;
}>;
