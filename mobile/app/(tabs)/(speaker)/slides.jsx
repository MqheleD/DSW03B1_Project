import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Modal,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import supabase from "../../supabaseClient";
import { WebView } from "react-native-webview";
import { ThemeContext } from "@/hooks/ThemeContext";
import { UserAuth } from "@/hooks/AuthContext";
import { useIsFocused } from "@react-navigation/native";

export default function App() {
  const { currentColors } = useContext(ThemeContext);
  const { profile } = UserAuth();
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const Speakerchar = require('../../../assets/images/Speakerchar.png');
  // Fetch slides
  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase.from("presentation_slides").select("*");
      if (error) console.error("Error fetching slides:", error);
      else setSlides(data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const isFocused = useIsFocused();
  //fetches the slides everytime they are uloaded 
  useEffect(() => {
    fetchSlides();
  }, []);


  useEffect(() => {
    if (isFocused) {
      fetchSlides();
    }
  }, [isFocused]);

  const getViewerUrl = (url, type) => {
    if (!url) return null;
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      url.toLowerCase().endsWith(".pptx")
    ) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    }
    if (type === "application/pdf" || url.toLowerCase().endsWith(".pdf")) return url;
    return url;
  };

  // Delete slide
  const handleDelete = async (slide) => {
    Alert.alert("Delete Slide", `Are you sure you want to delete "${slide.file_name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const filePath = slide.file_url.split(
              "/storage/v1/object/public/speaker-presentation-slides/"
            )[1];
            if (filePath) {
              const { error: storageError } = await supabase.storage
                .from("speaker-presentation-slides")
                .remove([filePath]);
              if (storageError) console.error("Storage delete error:", storageError);
            }

            const { error: dbError } = await supabase
              .from("presentation_slides")
              .delete()
              .eq("id", slide.id);
            if (dbError) console.error("DB delete error:", dbError);

            setSlides((prev) => prev.filter((s) => s.id !== slide.id));
          } catch (err) {
            console.error("Delete error:", err);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: currentColors.textPrimary }]}>
            Presentation Slides
          </Text>
        </View>

        <FlatList
          data={slides}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => setSelectedSlide(item)}
                style={[styles.slideCard, { backgroundColor: currentColors.cardBackground }]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text style={[styles.sessionName, { color: currentColors.textPrimary }]}>
                      {item.session_name}
                    </Text>
                    <Text style={[styles.fileName, { color: currentColors.textSecondary }]}>
                      {item.file_name}
                    </Text>

                  </View>

                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
        {selectedSlide && (
          <Modal visible={true} animationType="slide" transparent={false}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
              {/* Close Button */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedSlide(null)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close ✕</Text>
                </TouchableOpacity>
              </View>

              {/* Slide content */}
              <View style={styles.modalContent}>
                {selectedSlide.file_type?.startsWith("image/") ? (
                  <Image source={{ uri: selectedSlide.file_url }} style={styles.modalImage} />
                ) : (
                  <WebView
                    source={{ uri: getViewerUrl(selectedSlide.file_url, selectedSlide.file_type) }}
                    style={styles.webView}
                    originWhitelist={["*"]}
                    javaScriptEnabled
                    domStorageEnabled
                  />
                )}
              </View>
            </SafeAreaView>
          </Modal>
        )}


        <View style={styles.ImageContainer}>
          <Image source={Speakerchar} style={styles.image} />
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 12,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Each slide card
  slideCard: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    opacity: 0.7,
  },

  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ef4444",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Modal styles
  modalHeader: {
    padding: 12,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#000",
  },
  modalImage: {
    flex: 1,
    resizeMode: "contain",
  },
  webView: {
    flex: 1,
  },

  // Decorative bottom image
  ImageContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 100,
  },
  image: {
    width: 180,
    height: 140,
    resizeMode: "contain",
    opacity: 0.8,
  },
});
