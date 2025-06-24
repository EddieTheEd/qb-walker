import { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Audio } from "expo-av";

import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const [mode, setMode] = useState<"selecting" | "randomPrompt" | "reviewPrompt">("selecting");

  const handleSingleButtonPress = async () => {
    if (mode === "randomPrompt") {
      try {
        const { sound } = await Audio.Sound.createAsync({
          uri: "https://6d1564fa.terminal-551.pages.dev/blowboe.mp3",
        });
        await sound.playAsync();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    } else {
      alert("Review button pressed!");
    }
  };

  const initialButtons = [
    {
      label: "Go to Random Prompt",
      onPress: () => setMode("randomPrompt"),
    },
    {
      label: "Go to Review Prompt",
      onPress: () => setMode("reviewPrompt"),
    },
  ];

  const renderInitialButtons = () =>
    initialButtons.map((btn, index) => (
      <TouchableOpacity
        key={index}
        style={buttonStyles.stackButton}
        onPress={btn.onPress}
      >
        <Text style={buttonStyles.buttonText}>{btn.label}</Text>
      </TouchableOpacity>
    ));

  return (
    <>
      <View style={buttonStyles.topHalf}>
        {mode === "selecting" ? (
          <View style={buttonStyles.stackContainer}>{renderInitialButtons()}</View>
        ) : (
          <TouchableOpacity
            style={
              mode === "randomPrompt"
                ? buttonStyles.singleButtonPurple
                : buttonStyles.singleButtonYellow
            }
            onPress={handleSingleButtonPress}
          >
            <Text style={buttonStyles.buttonText}>
              {mode === "randomPrompt"
                ? "Random"
                : "Review"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          to get a fresh{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory.
        </ThemedText>
      </ThemedView>
    </>
  );
}

const { height } = Dimensions.get("window");

const buttonStyles = StyleSheet.create({
  topHalf: {
    height: height / 2,
    padding: 16,
    justifyContent: "center",
  },
  stackContainer: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  stackButton: {
    backgroundColor: "#3498db",
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  singleButtonPurple: {
    flex: 1,
    backgroundColor: "#9b59b6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  singleButtonYellow: {
    flex: 1,
    backgroundColor: "#f1c40f",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

