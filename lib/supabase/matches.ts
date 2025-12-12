import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email?: string;
  gender: string;
  birthdate: string;
  bio?: string;
  avatar_url?: string;
  preferences?: any;
  location_lat?: number;
  location_lng?: number;
  last_active: string;
  is_verified: boolean;
  is_online?: boolean;
  is_visible?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPotentialMatches(): Promise<UserProfile[]> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get users the current user has already liked or passed
  const { data: likedUsers } = await supabase
    .from("likes")
    .select("to_user_id")
    .eq("from_user_id", user.id);

  const { data: passedUsers } = await supabase
    .from("passes")
    .select("to_user_id")
    .eq("from_user_id", user.id);

  const excludedUserIds = [
    user.id,
    ...(likedUsers?.map((l) => l.to_user_id) || []),
    ...(passedUsers?.map((p) => p.to_user_id) || []),
  ];

  // Get potential matches excluding already interacted users
  const { data: potentialMatches, error } = await supabase
    .from("users")
    .select("*")
    .not("id", "in", `(${excludedUserIds.join(",")})`)
    .limit(50);

  if (error) {
    throw new Error("Failed to fetch potential matches");
  }

  // Get user preferences
  const { data: userPrefs, error: prefsError } = await supabase
    .from("users")
    .select("preferences")
    .eq("id", user.id)
    .single();

  if (prefsError) {
    throw new Error("Failed to get user preferences");
  }

  const currentUserPrefs = userPrefs.preferences as any;
  const genderPreference = currentUserPrefs?.gender_preference || [];

  // Filter and map matches
  const filteredMatches =
    potentialMatches
      ?.filter((match) => {
        if (!genderPreference || genderPreference.length === 0) {
          return true;
        }
        return genderPreference.includes(match.gender);
      })
      .map((match) => ({
        id: match.id,
        full_name: match.full_name,
        username: match.username,
        email: "",
        gender: match.gender,
        birthdate: match.birthdate,
        bio: match.bio,
        avatar_url: match.avatar_url,
        preferences: match.preferences,
        location_lat: undefined,
        location_lng: undefined,
        last_active: new Date().toISOString(),
        is_verified: true,
        is_visible: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) || [];

  return filteredMatches;
}

export async function likeUser(toUserId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { error: likeError } = await supabase.from("likes").insert({
    from_user_id: user.id,
    to_user_id: toUserId,
  });

  if (likeError) {
    throw new Error("Failed to create like");
  }

  const { data: existingLike, error: checkError } = await supabase
    .from("likes")
    .select("*")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", user.id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error("Failed to check for match");
  }

  if (existingLike) {
    const { data: matchedUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", toUserId)
      .single();

    if (userError) {
      throw new Error("Failed to fetch matched user");
    }

    return {
      success: true,
      isMatch: true,
      matchedUser: matchedUser as UserProfile,
    };
  }

  return { success: true, isMatch: false };
}

// Handle passing
export async function passUser(toUserId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("passes").insert({
    from_user_id: user.id,
    to_user_id: toUserId,
  });

  if (error) {
    throw new Error("Failed to record pass");
  }

  return { success: true };
}

// Reset passes
export async function resetPasses() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { error } = await supabase
    .from("passes")
    .delete()
    .eq("from_user_id", user.id);

  if (error) {
    throw new Error("Failed to reset passes");
  }

  return { success: true };
}
