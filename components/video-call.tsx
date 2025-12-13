import { getStreamVideoToken } from "@/lib/get-stream-io/stream";
import {
  Call,
  CallContent,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface VideoCallProps {
  callId: string;
  onCallEnd: () => void;
  isIncoming?: boolean;
}

export default function VideoCall({
  callId,
  onCallEnd,
  isIncoming = false,
}: VideoCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeVideoCall() {
      if (hasJoined) {
        return;
      }

      try {
        setError(null);
        const { token, userId, userImage, userName } =
          await getStreamVideoToken();

        if (!isMounted) return;

        const videoClient = new StreamVideoClient({
          apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
          user: {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token,
        });

        if (!isMounted) return;

        const videoCall = videoClient.call("default", callId);

        if (isIncoming) {
          await videoCall.join();
        } else {
          await videoCall.join({ create: true });
        }

        if (!isMounted) return;

        setClient(videoClient);
        setCall(videoCall);
        setHasJoined(true);
      } catch (error) {
        console.error(error);
        setError("Failed to initiate call");
      } finally {
        setLoading(false);
      }
    }

    initializeVideoCall();

    return () => {
      isMounted = false;
      if (call && hasJoined) {
        call.leave();
      }

      if (client) {
        client.disconnectUser();
      }
    };
  }, [callId, isIncoming, hasJoined]);

  if (loading) {
    return (
      <View className="absolute inset-0 bg-black/75 flex items-center justify-center z-50">
        <View className="text-center">
          <ActivityIndicator size="large" color="#ffffff" className="mb-4" />
          <Text className="text-lg text-white">
            {isIncoming ? "Joining call..." : "Starting call..."}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="absolute inset-0 bg-black/75 flex items-center justify-center z-50">
        <View className="text-center max-w-md mx-auto p-8">
          <View className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Text className="text-2xl">❌</Text>
          </View>
          <Text className="text-xl font-semibold mb-2 text-white">
            Call Error
          </Text>
          <Text className="text-gray-300 mb-4">{error}</Text>
          <TouchableOpacity
            onPress={onCallEnd}
            className="bg-gradient-to-r from-pink-500 to-red-500 py-3 px-6 rounded-full active:opacity-80"
          >
            <Text className="text-white font-semibold text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!client || !call) {
    return (
      <View className="absolute inset-0 bg-black/75 flex items-center justify-center z-50">
        <View className="text-center">
          <ActivityIndicator size="large" color="#ffffff" className="mb-4" />
          <Text className="text-lg text-white">Setting up call...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="absolute inset-0 bg-black z-50">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent onHangupCallHandler={onCallEnd} />
        </StreamCall>
      </StreamVideo>
    </View>
  );
}
