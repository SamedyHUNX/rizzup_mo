import { StreamChat } from "stream-chat";
import { supabase } from "./supabase";

export async function getStreamUserToken() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    throw new Error("Failed to fetch user data");
  }

  const serverClient = StreamChat.getInstance(
    process.env.EXPO_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const token = serverClient.createToken(user.id);

  await serverClient.upsertUser({
    id: user.id,
    name: userData.full_name,
    image: userData.avatar_url || undefined,
  });

  return {
    token,
    userId: user.id,
    userName: userData.full_name,
    userImage: userData.avatar_url || undefined,
  };
}
