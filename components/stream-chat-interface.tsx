import {
  createOrGetChannel,
  createVideoCall,
  ensureStreamChatConnected,
  getStreamUserToken,
} from "@/lib/get-stream-io/stream";
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
import VideoCall from "./video-call";

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

    let isMounted = true;
    let chatClient: StreamChat | null = null;

    async function initializeChat() {
      try {
        setError(null);
        console.log("Starting chat initialization...");

        // Step 1: Get Stream token
        console.log("Getting Stream user token...");
        const tokenResponse = await getStreamUserToken();

        if (!tokenResponse.token || !tokenResponse.userId) {
          throw new Error("Failed to get Stream token");
        }

        const { token, userId, userName, userImage } = tokenResponse;

        if (!isMounted) return;
        setCurrentUserId(userId);
        console.log("Got user token for:", userId);

        // Step 2: Initialize Stream client
        console.log("Initializing Stream client...");
        chatClient = await ensureStreamChatConnected(
          userId,
          token,
          userName,
          userImage
        );
        console.log("User connected successfully");

        if (!isMounted) {
          return;
        }

        // Step 4: Create or get channel
        console.log("Creating/getting channel...");
        const channelResponse = await createOrGetChannel(otherUser.id);

        if (!channelResponse.channelType || !channelResponse.channelId) {
          throw new Error(
            channelResponse.message || "Failed to create channel"
          );
        }

        const { channelType, channelId } = channelResponse;
        console.log("Got channel:", channelId);

        // Step 5: Watch channel
        console.log("Watching channel...");
        const chatChannel = chatClient.channel(channelType, channelId);
        await chatChannel.watch();
        console.log("Channel watched successfully");

        if (!isMounted) {
          return;
        }

        // Step 6: Query messages
        console.log("Querying messages...");
        const state = await chatChannel.query({ messages: { limit: 50 } });
        console.log(`Loaded ${state.messages.length} messages`);

        const convertedMessages: Message[] = state.messages.map((msg) => ({
          id: msg.id,
          text: msg.text || "",
          sender: msg.user?.id === userId ? "me" : "other",
          timestamp: new Date(msg.created_at || new Date()),
          user_id: msg.user?.id || "",
        }));

        if (!isMounted) {
          return;
        }

        setMessages(convertedMessages);

        // Step 7: Set up event listeners
        console.log("Setting up event listeners...");

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

        if (!isMounted) {
          return;
        }

        setClient(chatClient);
        setChannel(chatChannel);
        console.log("Chat initialization complete!");
      } catch (error) {
        console.error("Error initializing chat:", error);

        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to initialize chat";
          setError(errorMessage);

          // Only redirect after a delay to show error
          setTimeout(() => {
            if (isMounted) {
              router.push("/chat");
            }
          }, 2000);
        }

        // Clean up client if it was created
        // We don't disconnect here because it might be used by other components
        // Only disconnect if we specifically want to kill the session
        console.warn(
          "Error in chat initialization, but keeping client alive if possible"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (otherUser) {
      initializeChat();
    }

    return () => {
      isMounted = false;
      // Do NOT disconnect client here as it's shared
    };
  }, [otherUser?.id]);

  async function handleVideoCall() {
    try {
      const response = await createVideoCall(otherUser.id);

      if (!response.callId) {
        throw new Error(response.message || "Failed to create video call");
      }

      const { callId } = response;
      setVideoCallId(callId);
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
      console.error("Error creating video call:", error);
      alert("Failed to start video call");
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
        alert("Failed to send message");
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

  // Show error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-4">
        <View className="items-center">
          <Text className="text-xl font-semibold text-red-500 mb-2">
            Chat Error
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {error}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting...
          </Text>
        </View>
      </View>
    );
  }

  // Show loading state
  if (loading || !client || !channel) {
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
      <View className="border-t border-gray-200 dark:border-gray-700 px-2 py-4">
        <View className="flex-row items-center gap-3">
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
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full dark:bg-gray-800 dark:text-white"
            editable={!!channel}
            multiline={false}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || !channel}
            className={`px-6 py-3 bg-pink-500 rounded-full ${
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
