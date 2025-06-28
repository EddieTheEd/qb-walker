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
import historyDataJson from "../../data/qb_history.json";
import scienceDataJson from "../../data/qb_science.json";

import * as FileSystem from "expo-file-system";

export default function HomeScreen() {

  const [indexes, setIndexes] = useState(null);
  const [randomNum, setRandomNum] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState(null);
  const [scienceData, setScienceData] = useState(null);
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
    setHistoryData(historyDataJson);
  }, []);

  useEffect(() => {
    setScienceData(scienceDataJson);
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
          <ThemedText type="subtitle">Loading json - indexes</ThemedText>
          <ThemedText>
            This may take a while :}
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  if (!historyData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Loading json - history questions</ThemedText>
          <ThemedText>
            This may take a while :}
          </ThemedText>
        </ThemedView>
      </View>
    );
  }

  if (!scienceData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Loading json - science questions</ThemedText>
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

  const main = async () => {
    if (mode !== "randomPrompt") return;

    setIsPlaying(true);
    setForceNext(false);
    setFinalPhase(false);

    const max = indexes.science;
    const num = Math.floor(Math.random() * max);

    setRandomNum(num-1);

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
        style={mainStyles.stackButton}
        onPress={btn.onPress}
      >
        <Text style={mainStyles.buttonText}>{btn.label}</Text>
      </TouchableOpacity>
    ));

    const handleBuzzPress = async () => {
      setForceNext(true);
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          setFinalPhase(true);
          
          const url = `https://qb-walker-data.vercel.app/science/science-${randomNum + 1}-3.mp3`;

          playSound(url, () => setIsPlaying(false));
        } catch (e) {
          console.warn("Error handling buzz press", e);
        }
      }
    };

    return (
    <ThemedView>

      <ThemedView style={mainStyles.top}>
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
      </ThemedView>

      <ThemedView style={mainStyles.bottom}>
        {mode === "selecting" ? (
          <View style={mainStyles.stackContainer}>{renderInitialButtons()}</View>
        ) : finalPhase ? (
          <View style={mainStyles.stackContainer}>
            <TouchableOpacity
              style={mainStyles.stackButton}
              onPress={async () => {
                await stopSound();
                main();
              }}
            >
              <Text style={mainStyles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={mainStyles.stackButton}
              onPress={async () => {
                await stopSound();
                setMode("selecting");
                setFinalPhase(false);
              }}
            >
              <Text style={mainStyles.buttonText}>Return</Text>
            </TouchableOpacity>
          </View>
          ) : isPlaying ? (
            <TouchableOpacity onPress={handleBuzzPress} style={[mainStyles.stackButton, mainStyles.buzzer]}>
              <Text style={mainStyles.buttonText}>Buzz</Text>
            </TouchableOpacity>
          ) : null}
      </ThemedView>
      
      {finalPhase && randomNum !== null && scienceData[randomNum] && (
        <ThemedView style={styles.trueBottom}>
          <ThemedText type="subtitle">Question:</ThemedText>
          <ThemedText>{scienceData[randomNum].question}</ThemedText>

          <ThemedText type="subtitle" style={{ marginTop: 12 }}>Answer:</ThemedText>
          <ThemedText>{scienceData[randomNum].answer}</ThemedText>
        </ThemedView>
      )}

    </ThemedView>
  );
}

const { height } = Dimensions.get("window");

const mainStyles = StyleSheet.create({
  top: {
    height: height / 4,
    alignItems: "center",
    paddingTop: 48,
    gap: 16,
  },
  bottom: {
    height: height / 4,
    padding: 16,
    justifyContent: "flex-start",
  },
  trueBottom: {
    height: height / 2,
    padding: 16,
    justifyContent: "flex-start",
  },
  stackContainer: {
    justifyContent: "center",
  },
  stackButton: {
    backgroundColor: "#1a2559",
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buzzer: {
    backgroundColor: "#da090c",
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

