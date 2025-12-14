import { ChatData } from "@/types/chat.type";
import { StreamChat } from "stream-chat";
import { supabase } from "../supabase/supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function getStreamUserToken() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { success: false, error: "User not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/stream/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get Stream token");
    }

    const data = await response.json();

    return {
      token: data.token,
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage,
    };
  } catch (error) {
    console.error("Error getting Stream token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get token",
    };
  }
}

export async function createOrGetChannel(otherUserId: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { success: false, error: "User not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/stream/channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create channel");
    }

    const data = await response.json();

    return {
      channelType: data.channelType,
      channelId: data.channelId,
    };
  } catch (error) {
    console.error("Error creating channel:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create channel",
    };
  }
}

export async function createVideoCall(otherUserId: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { success: false, error: "User not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/stream/video-call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create video call");
    }

    const data = await response.json();

    return {
      callId: data.callId,
      callType: data.callType,
    };
  } catch (error) {
    console.error("Error creating video call:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create video call",
    };
  }
}

export async function getStreamVideoToken() {
  return getStreamUserToken();
}

let chatClient: StreamChat | null = null;

// Initialize Stream Chat client
export async function initStreamChat(
  userId: string,
  token: string,
  userName: string,
  userImage: string
) {
  try {
    if (chatClient) {
      await chatClient.disconnectUser();
    }

    chatClient = StreamChat.getInstance(
      process.env.EXPO_PUBLIC_STREAM_API_KEY!
    );

    await chatClient.connectUser(
      {
        id: userId,
        name: userName,
        image: userImage,
      },
      token
    );

    return chatClient;
  } catch (error) {
    console.error("Error initializing Stream Chat:", error);
    throw error;
  }
}

// Ensure Stream Chat is connected, reusing existing connection if possible
export async function ensureStreamChatConnected(
  userId: string,
  token: string,
  userName: string,
  userImage: string
) {
  if (chatClient && chatClient.userID === userId) {
    return chatClient;
  }
  return initStreamChat(userId, token, userName, userImage);
}

// Get the current chat client instance
export function getChatClient() {
  return chatClient;
}

// Load chats for user matches
export async function loadChatsForMatches(
  userMatches: any[],
  currentUserId: string
): Promise<ChatData[]> {
  try {
    // Initialize chat client if not already initialized
    if (!chatClient) {
      const tokenData = await getStreamUserToken();
      if (!tokenData.token || !tokenData.userId) {
        console.warn("Could not get Stream token");
        return [];
      }

      await initStreamChat(
        tokenData.userId,
        tokenData.token,
        tokenData.userName,
        tokenData.userImage
      );
    }

    // Get all channels where the current user is a member
    const filter = {
      type: "messaging",
      members: { $in: [currentUserId] },
    };

    const sort = [{ last_message_at: -1 }] as const;

    const channels = await chatClient!.queryChannels(filter, sort, {
      watch: true,
      state: true,
    });

    // Map channels to ChatData format
    const chatData: ChatData[] = [];

    for (const channel of channels) {
      // Get the other user in the channel
      const members = Object.values(channel.state.members);
      const otherMember = members.find(
        (member) => member.user_id !== currentUserId
      );

      if (!otherMember || !otherMember.user) continue;

      // Find matching user profile from userMatches
      const matchedUser = userMatches.find(
        (match) => match.id === otherMember.user_id
      );

      if (!matchedUser) continue;

      // Get last message
      const messages = channel.state.messages;
      const lastMessage = messages[messages.length - 1];

      // Count unread messages
      const unreadCount = channel.countUnread() || 0;

      chatData.push({
        id: channel.id!,
        user: matchedUser,
        lastMessage: lastMessage?.text || "No messages yet",
        lastMessageTime: lastMessage?.created_at
          ? new Date(lastMessage.created_at).toISOString()
          : new Date().toISOString(),
        unreadCount,
      });
    }

    return chatData;
  } catch (error) {
    console.error("Error loading chats:", error);
    throw error;
  }
}

// Setup message listener for real-time updates
export function setupMessageListener(
  onUpdate: () => void
): (() => void) | null {
  try {
    if (!chatClient) {
      console.warn("Chat client not initialized for message listener");
      // Return empty cleanup function instead of null
      return () => { };
    }

    // Listen for new messages
    const handleNewMessage = chatClient.on("message.new", (event) => {
      console.log("New message received:", event.message?.text);
      onUpdate();
    });

    // Listen for message updates
    const handleMessageUpdate = chatClient.on("message.updated", () => {
      onUpdate();
    });

    // Listen for message deletions
    const handleMessageDelete = chatClient.on("message.deleted", () => {
      onUpdate();
    });

    // Listen for channel updates
    const handleChannelUpdate = chatClient.on("channel.updated", () => {
      onUpdate();
    });

    // Listen for when messages are read
    const handleMessageRead = chatClient.on("message.read", () => {
      onUpdate();
    });

    // Return cleanup function
    return () => {
      handleNewMessage.unsubscribe();
      handleMessageUpdate.unsubscribe();
      handleMessageDelete.unsubscribe();
      handleChannelUpdate.unsubscribe();
      handleMessageRead.unsubscribe();
    };
  } catch (error) {
    console.error("Error setting up message listener:", error);
    return null;
  }
}

// Disconnect Stream Chat client
export async function disconnectStreamChat() {
  try {
    if (chatClient) {
      await chatClient.disconnectUser();
      chatClient = null;
    }
  } catch (error) {
    console.error("Error disconnecting Stream Chat:", error);
  }
}

// Mark channel as read
export async function markChannelAsRead(channelId: string) {
  try {
    if (!chatClient) {
      throw new Error("Chat client not initialized");
    }

    const channel = chatClient.channel("messaging", channelId);
    await channel.markRead();
  } catch (error) {
    console.error("Error marking channel as read:", error);
  }
}
