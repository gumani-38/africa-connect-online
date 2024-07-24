import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import { supabase } from "../utils/supabase";

const FeedMedia = ({ postId }) => {
  const [postMedia, setPostMedia] = useState([]);
  const [mediaActive, setMediaActive] = useState(0);
  const [videoStatus, setVideoStatus] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const video = useRef(null);

  useEffect(() => {
    if (postId) {
      getPostMedia();
    }
  }, []);

  const getPostMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("post_media")
        .select(`*`)
        .eq("post", postId);
      if (error) {
        throw error;
      }
      setPostMedia(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImage(postMedia[index].media);
    setShowImagePreview(true);
  };

  const onCloseImagePreview = () => {
    setSelectedImage(null);
    setShowImagePreview(false);
  };

  const onchange = (nativeEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
      );
      if (slide !== mediaActive) {
        setMediaActive(slide);
      }
    }
  };

  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      {postMedia.length > 0 && (
        <ScrollView
          onScroll={({ nativeEvent }) => onchange(nativeEvent)}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          horizontal
          style={{ width: 300, height: 250 }}
        >
          {postMedia?.map((item, index) =>
            item.type === "image" ? (
              <TouchableWithoutFeedback
                key={item.id}
                onPress={() => handleImageClick(index)}
              >
                <Image
                  source={{ uri: item.media }}
                  resizeMode="contain"
                  style={{ width: 300, height: 250 }}
                />
              </TouchableWithoutFeedback>
            ) : (
              <View key={item.id}>
                <Video
                  ref={video}
                  source={{ uri: item.media }}
                  style={{
                    width: 300,
                    height: 250,
                  }}
                  useNativeControls
                  isLooping
                  onPlaybackStatusUpdate={(status) =>
                    setVideoStatus(() => status)
                  }
                  resizeMode={ResizeMode.CONTAIN}
                />
                <View style={styles.buttons}>
                  <Button
                    title={videoStatus.isPlaying ? "Pause" : "Play"}
                    onPress={() =>
                      videoStatus.isPlaying
                        ? video.current.pauseAsync()
                        : video.current.playAsync()
                    }
                  />
                </View>
              </View>
            )
          )}
        </ScrollView>
      )}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {postMedia.map((item, index) => (
          <Text
            key={item.id}
            style={mediaActive === index ? styles.dotActive : styles.dot}
          >
            &#x25cf;
          </Text>
        ))}
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        onRequestClose={onCloseImagePreview}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={onCloseImagePreview}>
            <Image
              source={{ uri: selectedImage }}
              resizeMode="contain"
              style={styles.previewImage}
            />
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dotActive: {
    margin: 3,
    color: "#9B0E10",
  },
  dot: {
    margin: 3,
    color: "#888",
  },
  buttons: {},
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  previewImage: {
    width: "90%",
    height: "90%",
  },
});

export default FeedMedia;
