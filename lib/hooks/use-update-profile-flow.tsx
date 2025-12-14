import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "../supabase/functions/profile";
import { useAsyncHandler } from "./use-async-handler";

export function useProfileUpdateFlow() {
  const [saving, setSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    gender: "male",
    birthdate: "",
    avatar_url: "",
  });

  const { loading, message, type, run } = useAsyncHandler();

  const loadProfile = useCallback(
    () =>
      run(async () => {
        const { success, data } = await getCurrentUserProfile();
        if (success && data) {
          setFormData({
            full_name: data.full_name || "",
            username: data.username || "",
            bio: data.bio || "",
            gender: data.gender || "male",
            birthdate: data.birthdate || "",
            avatar_url: data.avatar_url || "",
          });
        }
      }),
    [run]
  );

  const formSubmit = () => {
    run(async () => {
      try {
        setSaving(true);
        const { success, message } = await updateUserProfile(formData);

        if (success) {
          // Navigate back after a short delay
          setTimeout(() => router.push("/profile"), 1500);
        }
        // run() already handles setMessage and setType
      } finally {
        setSaving(false);
      }
    });
  };

  const inputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const dateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split("T")[0];
        inputChange("birthdate", dateString);
      }
    } else {
      // iOS - just update temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const dateConfirm = () => {
    const dateString = tempDate.toISOString().split("T")[0];
    inputChange("birthdate", dateString);
    setShowDatePicker(false);
  };

  const dateCancel = () => {
    setShowDatePicker(false);
  };

  return {
    loadProfile,
    formSubmit,
    inputChange,
    dateChange,
    dateConfirm,
    dateCancel,
    loading,
    message,
    type,
    saving,
    showDatePicker,
    formData,
    setShowDatePicker,
    tempDate,
  };
}
