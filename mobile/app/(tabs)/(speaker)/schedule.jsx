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
                    <Text style={{ color: currentColors.textSecondary }}>
                      {item.file_name}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={{ padding: 8, backgroundColor: "#ef4444", borderRadius: 6 }}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
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
      <View
        style={{
          padding: 12,
          backgroundColor: "#111",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          onPress={() => setSelectedSlide(null)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: "#ef4444",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Close ✕</Text>
        </TouchableOpacity>
      </View>

      {/* Slide content */}
      <View style={{ flex: 1 }}>
        {selectedSlide.file_type?.startsWith("image/") ? (
          <Image
            source={{ uri: selectedSlide.file_url }}
            style={{ flex: 1, resizeMode: "contain" }}
          />
        ) : (
          <WebView
            source={{
              uri: getViewerUrl(selectedSlide.file_url, selectedSlide.file_type),
            }}
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
    </SafeAreaView>
  </Modal>
)}


      </View>
     <View style={styles.ImageContainer}>
          <Image source={Speakerchar} style={styles.image} />
     </View>
   
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { 
    flex: 1, 
    padding: 16 
  },
    image: {
    width: 200,
    height: 150,
    resizeMode: "contain", 
   
  },
  header: {
     paddingVertical: 16 
    },
  headerText: { 
    fontSize: 24, 
    fontWeight: "bold" 
  },
  slideCard: {
     marginBottom: 16,
      padding: 12,
       borderRadius: 8
       },
  sessionName: { 
    fontWeight: "bold", 
    fontSize: 16 
  },
  imagePreview: {
     width: "100%",
      height: 200, 
      marginTop: 10,
       borderRadius: 6
       },
  webView: {
     width: "100%",
     height: 500,
      marginTop: 10,
       borderRadius: 6 
      },
      ImageContainer:{
        width: '53%', 
         height:'27%',
         alignItems:'center',
         marginLeft:'20%'
      }
});




