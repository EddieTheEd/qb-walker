import { useState, useEffect, useRef } from "react";
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

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import * as FileSystem from "expo-file-system";

export default function HomeScreen() {

  const [indexes, setIndexes] = useState(null);
  const [mode, setMode] = useState<"selecting" | "randomPrompt" | "reviewPrompt">("selecting");
  const [isPlaying, setIsPlaying] = useState(false);
  const [forceNext, setForceNext] = useState(false);
  const [finalPhase, setFinalPhase] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const bell = require("../../assets/sounds/bell.wav");


  useEffect(() => {
    fetch('https://qb-walker-data.vercel.app/indexes.json')
      .then((res) => res.json())
      .then((json) => setIndexes(json))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (mode === "randomPrompt") {
      main();
    }
  }, [mode]);


  if (!indexes) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Loading json...</ThemedText>
          <ThemedText>
            This may take a while :}
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  const checkIfExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  const playSound = async (
    source: string | number,
    onFinish?: () => void
  ) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        typeof source === "string" ? { uri: source } : source
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && !status.isLooping && onFinish) {
          onFinish();
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error("Playback error:", error);
      onFinish?.();
    }
  };


  const stopSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (e) {
        console.warn("Error stopping sound", e);
      }
    }
  };

  const playBell = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(bell);
      soundRef.current = sound;

      await sound.playAsync();

    } catch (error) {
      console.error("Error playing bell:", error);
    }
  };


  const main = async () => {
    if (mode !== "randomPrompt") return;

    setIsPlaying(true);
    setForceNext(false);
    setFinalPhase(false);

    const max = indexes.science;
    const num = Math.floor(Math.random() * max) + 1;
    const base = `https://qb-walker-data.vercel.app/science/science-${num}`;

    const question1 = `${base}-1.mp3`;
    const question2 = `${base}-2.mp3`;
    const answer = `${base}-3.mp3`;

    const secondpartexists = await checkIfExists(question2);

    const playThird = () => {
      setFinalPhase(true);
      playSound(answer, () => {
        setIsPlaying(false);
      });
    };


    const playSecondOrThird = () => {
      if (forceNext) return playThird();
      if (secondpartexists) {
        playSound(bell, () => {
          playSound(question2, playThird);
        });
      } else {
        playThird();
      }
    };

    playSound(question1, playSecondOrThird);
  };


  const initialButtons = [
    {
      label: "Random",
      onPress: () => setMode("randomPrompt")
    },
    {
      label: "Review",
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
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Quizbowl walker!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Available questions:</ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Science</ThemedText>: {indexes.science}
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">History</ThemedText>: {indexes.history}
        </ThemedText>
      </ThemedView>

      <View style={buttonStyles.bottom}>
        {mode === "selecting" ? (
          <View style={buttonStyles.stackContainer}>{renderInitialButtons()}</View>
        ) : finalPhase ? (
          <View style={buttonStyles.stackContainer}>
            <TouchableOpacity
              style={buttonStyles.stackButton}
              onPress={async () => {
                await stopSound();
                main();
              }}
            >
              <Text style={buttonStyles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.stackButton}
              onPress={async () => {
                await stopSound();
                setMode("selecting");
                setFinalPhase(false);
              }}
            >
              <Text style={buttonStyles.buttonText}>Return</Text>
            </TouchableOpacity>
          </View>
          ) : isPlaying ? (
            <TouchableOpacity
              onPress={() => {
                setForceNext(true);
                if (soundRef.current) {
                  soundRef.current.stopAsync().then(() => {
                    soundRef.current?.unloadAsync();
                    setFinalPhase(true);
                    playSound(
                      `https://qb-walker-data.vercel.app/science/science-${Math.floor(
                        Math.random() * indexes.science
                      ) + 1}-3.mp3`,
                      () => setIsPlaying(false)
                    );
                  });
                }
              }}
              style={buttonStyles.buzzer}
            >
              <Text style={buttonStyles.buttonText}>Buzz</Text>
            </TouchableOpacity>
          ) : null}
      </View>
    </>
  );
}

const { height } = Dimensions.get("window");

const buttonStyles = StyleSheet.create({
  bottom: {
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
  buzzer: {
    backgroundColor: "#da090c",
    paddingVertical: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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

