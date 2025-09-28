import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { Ionicons } from "@expo/vector-icons";
import supabase from "@/app/supabaseClient";
import { UserAuth } from "../../hooks/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / numColumns;

const getRandomRotation = () => `${Math.random() * 6 - 3}deg`;

export default function Feed() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMineOnly, setShowMineOnly] = useState(false);

  const { session } = UserAuth();
  const userId = session?.user?.id;

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = showMineOnly
        ? await query.eq("user_id", userId)
        : await query;

      if (error) throw error;

      const formatted = data.map((item) => ({
        id: item.id,
        image_url: item.image_url,
        user_id: item.user_id,
        file_path: item.image_url.split("/user-uploads/")[1],
      }));

      setImages(formatted);
    } catch (err) {
      console.error("Error fetching images:", err.message);
      Alert.alert("Error", "Could not load images.");
    } finally {
      setLoading(false);
    }
  }, [showMineOnly, userId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      // aspect: [1, 1],
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadToSupabase(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      // aspect: [1, 1],
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadToSupabase(result.assets[0].base64);
    }
  };

  const uploadToSupabase = useCallback(
    async (base64Data) => {
      try {
        setUploading(true);

        const fileExt = "jpg"; // you can make this dynamic if needed
        const filePath = `user-uploads/image_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-photos")
          .upload(filePath, decode(base64Data), {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("user-photos")
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from("photos").insert({
          user_id: userId,
          image_url: publicUrlData.publicUrl,
        });

        if (insertError) throw insertError;

        Alert.alert("Upload successful!");
        fetchImages();
      } catch (err) {
        console.error("Upload error:", err.message);
        Alert.alert("Upload failed", err.message);
      } finally {
        setUploading(false);
      }
    },
    [userId, fetchImages]
  );

  const handleDelete = async (image) => {
    Alert.alert("Delete Image", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error: storageError } = await supabase.storage
              .from("user-photos")
              .remove([image.file_path]);

            if (storageError) throw storageError;

            const { error: dbError } = await supabase
              .from("photos")
              .delete()
              .eq("id", image.id);

            if (dbError) throw dbError;

            Alert.alert("Deleted");
            setSelectedImage(null);
            fetchImages();
          } catch (err) {
            console.error("Delete error:", err.message);
            Alert.alert("Error", "Could not delete image.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={require('@/assets/images/header-image.png')} // or use a remote URI
        style={styles.bannerImage}
        resizeMode="contain"
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#555" />
        </View>
      ) : images.length === 0 ? (
        <View style={styles.loader}>
          <Text>No images yet. Be the first to upload!</Text>
        </View>
      ) : (
        <View style={{ alignContent: "center", justifyContent: "center", flex: 1 }}>
          <FlatList
            data={images}
            style={{paddingHorizontal: 5}}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <Pressable onPress={() => setSelectedImage(item)}>
                <View
                  style={[styles.imageContainer, { transform: [{ rotate: getRandomRotation() }] }]}
                >
                  <Image source={{ uri: item.image_url }} style={styles.image} />
                  <Text style={styles.polaroidLabel}>Avijozi 2025</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleImagePick}
          disabled={uploading}
          style={[styles.iconButton, uploading && { opacity: 0.5 }]}
        >
          <Ionicons name="cloud-upload-outline" size={28} color="#333" />
        </Pressable>
        <Pressable
          onPress={takePhoto}
          disabled={uploading}
          style={[styles.iconButton, uploading && { opacity: 0.5 }]}
        >
          <Ionicons name="camera-outline" size={28} color="#333" />
        </Pressable>
        <Pressable
          onPress={() => setShowMineOnly((prev) => !prev)}
          style={styles.iconButton}
        >
          <Ionicons
            name={showMineOnly ? "person" : "people"}
            size={28}
            color="#333"
          />
        </Pressable>
      </View>

      <Modal
        isVisible={!!selectedImage}
        onBackdropPress={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedImage?.user_id === userId && (
            <Pressable
              style={styles.deleteIcon}
              onPress={() => handleDelete(selectedImage)}
            >
              <Ionicons name="trash-outline" size={28} color="#fff" />
            </Pressable>
          )}
          <Image
            source={{ uri: selectedImage?.image_url }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  buttonRow: { position: "absolute", bottom: 20, flexDirection: "row", gap: 12 },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    margin: 10,
    alignItems: "center",
    padding: 20,
  },
  polaroidLabel: { marginTop: 6, fontSize: 12, color: "#333", fontStyle: "italic" },
  image: { width: "100%", height: imageSize - 40, borderRadius: 6, backgroundColor: "#eee" },
  modalOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 10,
  },
  fullImage: { width: "100%", height: 400 },
  closeButton: { marginTop: 20, backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: "center", elevation: 3 },
  closeText: { fontWeight: "bold" },
  deleteIcon: { position: "absolute", top: 10, right: 10, zIndex: 10 },
  bannerImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f3f4f6",
  },
});
