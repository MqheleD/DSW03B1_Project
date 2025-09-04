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
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import supabase from "@/app/supabaseClient";
import { UserAuth } from "../../hooks/AuthContext";

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
        file_path: item.image_url.split("/user-photos/")[1],
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

  const handleImagePick = async (camera = false) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert(
        "Permission required",
        `Please allow access to your ${camera ? "camera" : "photo library"}.`
      );
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });

    if (!result.canceled) {
      await uploadToSupabase(result.assets[0].uri);
    }
  };

  const uploadToSupabase = useCallback(
    async (uri) => {
      try {
        setUploading(true);

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const fileExt = uri.split(".").pop() || "jpg";
        const filePath = `user-uploads/image_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-photos")
          .upload(filePath, byteArray, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const publicUrl = supabase.storage
          .from("user-photos")
          .getPublicUrl(filePath).data.publicUrl;

        const { error: insertError } = await supabase.from("photos").insert({
          user_id: userId,
          image_url: publicUrl,
        });

        if (insertError) throw insertError;

        Alert.alert("Upload successful");
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
    <View style={styles.container}>
      <Image
        source={{
          uri: `https://avijozi.zohobackstage.com/public/portals/880205061/siteResources/161390000000092631`,
        }}
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
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedImage(item)}>
              <View
                style={[
                  styles.imageContainer,
                  { transform: [{ rotate: getRandomRotation() }] },
                ]}
              >
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <Text style={styles.polaroidLabel}>Avijozi 2025</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => handleImagePick(false)}
          disabled={uploading}
          style={[styles.iconButton, uploading && { opacity: 0.5 }]}
        >
          <Ionicons name="cloud-upload-outline" size={28} color="#333" />
        </Pressable>
        <Pressable
          onPress={() => handleImagePick(true)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 50,
    // paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  buttonRow: {
    position: "absolute",
    bottom: 20,
    // right: 20,
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  polaroidLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#333",
    fontStyle: "italic",
  },
  image: {
    width: "100%",
    height: imageSize - 40,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  modalOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 10,
  },
  fullImage: {
    width: "100%",
    height: 400,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    elevation: 3,
  },
  bannerImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#f3f4f6",
  },
});
