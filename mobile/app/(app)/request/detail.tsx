import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { requestService } from "@/src/services/requestService";
import { useLocationStore } from "@/src/stores/locationStore";
import {
  useUIStore,
  type PendingRequest,
} from "@/src/stores/uiStore";
import { AppError } from "@/src/services/api";

const schema = z.object({
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RequestDetailScreen() {
  const router = useRouter();
  const {
    requestDraft,
    updateDraft,
    resetDraft,
    enqueuePendingRequest,
  } = useUIStore();
  const { selectedLocation } = useLocationStore();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { description: requestDraft.description },
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateDraft({
        photoUris: [...requestDraft.photoUris, result.assets[0].uri],
      });
    }
  };

  const removePhoto = (uri: string) => {
    updateDraft({ photoUris: requestDraft.photoUris.filter((u) => u !== uri) });
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Mikrofon izni verilmedi");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch {
      alert("Ses kaydı başlatılamadı");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) updateDraft({ audioUri: uri });
    } catch {
      alert("Ses kaydı durdurulamadı");
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  const playAudio = async () => {
    if (!requestDraft.audioUri) return;
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: created } = await Audio.Sound.createAsync({
        uri: requestDraft.audioUri,
      });
      created.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
      setSound(created);
      await created.playAsync();
    } catch {
      alert("Ses dosyası oynatılamadı");
    }
  };

  const removeAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    updateDraft({ audioUri: null });
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => undefined);
      }
      if (sound) {
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, [recording, sound]);

  const onSubmit = async (data: FormData) => {
    if (!selectedLocation) return;
    if (!requestDraft.needTypes.length) {
      alert("En az bir ihtiyaç türü seçmelisiniz.");
      return;
    }

    const payload: PendingRequest = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      createdAt: Date.now(),
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      needType: requestDraft.needTypes[0],
      personCount: requestDraft.personCount,
      description: data.description?.trim() || undefined,
      photoUris: [...requestDraft.photoUris],
      audioUri: requestDraft.audioUri,
    };

    try {
      const created = await requestService.create({
        latitude: payload.latitude,
        longitude: payload.longitude,
        need_type: payload.needType,
        person_count: payload.personCount,
        description: payload.description,
      });

      // Upload photos if any
      for (const uri of payload.photoUris) {
        await requestService.uploadPhoto(created.id, uri);
      }

      if (sound) {
        await sound.stopAsync().catch(() => undefined);
        await sound.unloadAsync().catch(() => undefined);
        setSound(null);
      }

      resetDraft();
      router.replace(`/(app)/requests/${created.id}`);
    } catch (err) {
      if (err instanceof AppError && err.isNetworkError) {
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
          } catch {
            // no-op
          }
          setRecording(null);
        }
        if (sound) {
          await sound.stopAsync().catch(() => undefined);
          await sound.unloadAsync().catch(() => undefined);
          setSound(null);
        }
        enqueuePendingRequest(payload);
        resetDraft();
        alert(
          "İnternet bağlantınız kesildi. Talebiniz kaydedildi ve bağlantı gelince otomatik gönderilecek."
        );
        router.replace("/(app)/(tabs)/reports");
        return;
      }

      const msg = err instanceof Error ? err.message : "Hata oluştu";
      alert(msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary px-4 py-4 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-white text-xl font-bold">←</Text>
        </Pressable>
        <View>
          <Text className="text-white font-bold text-lg">Ek Bilgi</Text>
          <Text className="text-white/70 text-xs">İsteğe bağlı</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <Text className="text-xl font-bold text-text-primary mb-2">
          Detaylar
        </Text>
        <Text className="text-text-secondary text-sm mb-6">
          Fotoğraf ve açıklama ekleyebilirsiniz (isteğe bağlı)
        </Text>

        {/* Summary */}
        <View className="bg-surface-card rounded-card p-4 mb-6">
          <Text className="text-xs font-semibold text-text-secondary uppercase mb-3">
            Talep Özeti
          </Text>
          <View className="flex-row gap-2 mb-2">
            <Text className="text-text-muted text-sm w-28">Kişi:</Text>
            <Text className="text-text-primary font-medium text-sm">
              {requestDraft.personCount} kişi
            </Text>
          </View>
          <View className="flex-row gap-2 mb-2">
            <Text className="text-text-muted text-sm w-28">İhtiyaçlar:</Text>
            <Text className="text-text-primary font-medium text-sm flex-1">
              {requestDraft.needTypes.join(", ")}
            </Text>
          </View>
          {selectedLocation && (
            <View className="flex-row gap-2">
              <Text className="text-text-muted text-sm w-28">Konum:</Text>
              <Text className="text-text-primary font-mono text-sm">
                {selectedLocation.latitude.toFixed(4)},{" "}
                {selectedLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-2">
            Açıklama{" "}
            <Text className="text-text-muted font-normal">(isteğe bağlı)</Text>
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                className="border border-border rounded-input px-4 py-3 text-text-primary text-sm"
                placeholder="Durumunuzu kısaca anlatın..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={{ minHeight: 100 }}
              />
            )}
          />
        </View>

        {/* Photos */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-text-primary mb-3">
            Fotoğraflar{" "}
            <Text className="text-text-muted font-normal">(isteğe bağlı)</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {requestDraft.photoUris.map((uri) => (
                <View key={uri} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-card"
                    resizeMode="cover"
                  />
                  <Pressable
                    className="absolute -top-2 -right-2 bg-primary rounded-full w-5 h-5 items-center justify-center"
                    onPress={() => removePhoto(uri)}
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable
                className="w-24 h-24 rounded-card border-2 border-dashed border-border items-center justify-center"
                onPress={pickPhoto}
              >
                <Text className="text-2xl">📷</Text>
                <Text className="text-text-muted text-xs mt-1">Ekle</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Audio Note */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-text-primary mb-3">
            Sesli Not{" "}
            <Text className="text-text-muted font-normal">(isteğe bağlı)</Text>
          </Text>

          {!requestDraft.audioUri ? (
            <Pressable
              className={`rounded-card border-2 border-dashed p-4 items-center ${
                isRecording ? "border-status-urgent bg-status-urgent/5" : "border-border"
              }`}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text className="text-2xl mb-1">{isRecording ? "⏹️" : "🎙️"}</Text>
              <Text
                className={`font-semibold text-sm ${
                  isRecording ? "text-status-urgent" : "text-text-primary"
                }`}
              >
                {isRecording ? "Kaydı Durdur" : "Sesli Not Kaydet"}
              </Text>
              <Text className="text-text-muted text-xs mt-1">
                {isRecording ? "Kayıt devam ediyor..." : "Dokunarak kayda başla"}
              </Text>
            </Pressable>
          ) : (
            <View className="bg-surface-card rounded-card border border-border p-4">
              <Text className="text-text-primary font-medium text-sm mb-2">
                ✅ Sesli not eklendi
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  className="bg-primary rounded-button px-4 py-2"
                  onPress={playAudio}
                >
                  <Text className="text-white text-xs font-semibold">
                    {isPlaying ? "Çalıyor..." : "Dinle"}
                  </Text>
                </Pressable>
                <Pressable
                  className="bg-white border border-border rounded-button px-4 py-2"
                  onPress={removeAudio}
                >
                  <Text className="text-text-secondary text-xs font-semibold">
                    Kaldır
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          className={`rounded-button py-4 items-center ${isSubmitting ? "bg-primary/60" : "bg-primary"}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              TALEBİ GÖNDER ✓
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
