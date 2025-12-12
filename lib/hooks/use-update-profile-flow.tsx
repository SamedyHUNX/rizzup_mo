import { router } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";
import { getCurrentUserProfile, updateUserProfile } from "../supabase/profile";
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

  const { loading, message, type, run, setType, setMessage } =
    useAsyncHandler();

  const loadProfile = () =>
    run(async () => {
      setMessage("");
      const { success, data, message } = await getCurrentUserProfile();
      if (success && data) {
        setType("success");
        setMessage(message);
        setFormData({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          gender: data.gender || "male",
          birthdate: data.birthdate || "",
          avatar_url: data.avatar_url || "",
        });
        return;
      }

      setType("error");
      setMessage(message);
    });

  const formSubmit = () => {
    run(async () => {
      try {
        setSaving(true);
        setMessage("");
        const { success, message } = await updateUserProfile(formData);
        if (success && message) {
          setType("success");
          setMessage(message);
          // Navigate back after a short delay
          setTimeout(() => router.push("/profile"), 1500);
          return;
        }
        setType("error");
        setMessage(message);
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
