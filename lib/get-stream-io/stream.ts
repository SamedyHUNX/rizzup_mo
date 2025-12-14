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
