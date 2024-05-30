import { Modal, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, generageRandomUid } from "../constants/colors";
import { ScrollView, View } from "tamagui";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import ColorPicker, {
  HueSlider,
  OpacitySlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";
import { Button } from "react-native";
import { Overlay } from "@rneui/themed";

export default function NewCard({ card, setCards, tagsShownHandler }) {
  const [showModal, setShowModal] = useState(false);
  const [frontColor, setFrontColor] = useState(Colors.primary_100);
  const [backColor, setBackColor] = useState(Colors.primary_100);
  const [isFront, setIsFront] = useState(true);
  

  const onSelectColor = ({ hex }) => {
    if (isFront) {
      setFrontColor(hex);
    } else {
      setBackColor(hex);
    }
    setCards((prev) => {
      return prev.map((thisCard) => {
        if (thisCard.id === card.id) {
          if (isFront) {
            thisCard.frontColor = hex;
          } else {
            thisCard.backColor = hex;
          }
        }
        return thisCard;
      });
    });
  };
  const translateX = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const trashStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value / -200,
    };
  });

  const initialTouchLocation = useSharedValue({ x: 0, y: 0 });

  const pan = Gesture.Pan()
    .runOnJS(true)

    .onChange((e) => {
      "worklet";
      if (translateX.value <= 0) {
        translateX.value += e.changeX;
      }
    })
    .onEnd(() => {
      "worklet";
      translateX.value = withSpring(0);
      if (translateX.value < -200) {
        runOnJS(() => {
          setCards((prev) => [
            ...prev.filter((thisCard) => card.id !== thisCard.id),
          ]);
        })();
      }
    });

  function openMoreHandler(gotCard, fb) {
    setCards((prev) => {
      return prev.map((card) => {
        if (card.id === gotCard.id) {
          if (fb === "f") {
            card.isMoreFront = !card.isMoreFront;
          } else {
            card.isMoreBack = !card.isMoreBack;
          }
        }
        return card;
      });
    });
  }

  function textChangeHandler(text, isFront, gotCard) {
    setCards((prev) => {
      return prev.map((card) => {
        if (card.id === gotCard.id) {
          if (isFront) {
            card.front = text;
          } else {
            card.back = text;
          }
        }
        return card;
      });
    });
  }

  return (
    <GestureDetector gesture={pan} key={card.id}>
      <Animated.View style={[cardStyle, styles.cardStack]}>
        <Animated.View style={[styles.cardContainer]}>
          <View style={styles.cardSection}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardText}>Front</Text>
              <View style={styles.cardInputContainer}>
                <TextInput
                  style={styles.cardInput}
                  onChangeText={(text) => textChangeHandler(text, true, card)}
                  value={card.front}
                />
              </View>
              <View
                style={[
                  styles.optionsContainer,
                  { display: card.isMoreFront ? "flex" : "none" },
                ]}
              >
                <AntDesign
                  name="picture"
                  size={24}
                  color={Colors.primary_100}
                />
                <Pressable onPress={tagsShownHandler.bind(this, card)}>
                  <AntDesign name="tags" size={24} color={Colors.primary_100} />
                </Pressable>
                <MaterialCommunityIcons
                  name="math-integral"
                  size={24}
                  color={Colors.primary_100}
                />
                <Pressable
                  onPress={() => {
                    setIsFront(true);
                    setShowModal(true);
                  }}
                >
                  <Foundation name="text-color" size={24} color={frontColor} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={openMoreHandler.bind(this, card, "f")}>
              {!card.isMoreFront ? (
                <AntDesign name="down" size={24} color={Colors.primary_700} />
              ) : (
                <AntDesign name="up" size={24} color={Colors.primary_700} />
              )}
            </Pressable>
          </View>
          <View style={styles.cardSection}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.cardText}>Back</Text>
              <View style={styles.cardInputContainer}>
                <TextInput
                  style={styles.cardInput}
                  value={card.back}
                  onChangeText={(text) => textChangeHandler(text, false, card)}
                />
              </View>
              <View
                style={[
                  styles.optionsContainer,
                  { display: card.isMoreBack ? "flex" : "none" },
                ]}
              >
                <AntDesign
                  name="picture"
                  size={24}
                  color={Colors.primary_100}
                />
                <Pressable onPress={tagsShownHandler.bind(this, card)}>
                  <AntDesign name="tags" size={24} color={Colors.primary_100} />
                </Pressable>
                <MaterialCommunityIcons
                  name="math-integral"
                  size={24}
                  color={Colors.primary_100}
                />
                <Pressable
                  onPress={() => {
                    setIsFront(false);
                    setShowModal(true);
                  }}
                >
                  <Foundation name="text-color" size={24} color={backColor} />
                </Pressable>
              </View>
            </View>
            <Pressable onPress={openMoreHandler.bind(this, card, "b")}>
              {!card.isMoreBack ? (
                <AntDesign name="down" size={24} color={Colors.primary_700} />
              ) : (
                <AntDesign name="up" size={24} color={Colors.primary_700} />
              )}
            </Pressable>
          </View>
        </Animated.View>
        <View style={styles.deleteContainer}>
          <Animated.View style={[trashStyle]}>
            <FontAwesome5 name="trash" size={35} color={Colors.secRed} />
          </Animated.View>
        </View>
        <Overlay
          isVisible={showModal}
          animationType="slide"
          overlayStyle={{ backgroundColor: "#00000000" }}
        >
          <ColorPicker
            style={{ width: "70%", backgroundColor: "#00000000" }}
            value={isFront ? frontColor : backColor}
            onComplete={onSelectColor}
          >
            <Preview style={{ marginBottom: 10 }} />
            <Panel1 style={{ marginBottom: 20 }} />
            <HueSlider style={{ marginBottom: 10 }} />
            <OpacitySlider style={{ marginBottom: 30 }} />
            <Swatches style={{ marginBottom: 10 }} />
          </ColorPicker>
          <Pressable
            onPress={() => {
              setShowModal(false);
            }}
          >
            <View
              style={[
                styles.saveButton,
                { backgroundColor: isFront ? frontColor : backColor },
              ]}
            >
              <Text style={styles.saveText}>Ok</Text>
            </View>
          </Pressable>
        </Overlay>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderColor: Colors.primary_700,
    borderWidth: 3,
    marginBottom: 10,
  },
  cardSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInputContainer: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.primary_100,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginRight: 10,
    marginLeft: 5,
  },
  cardLabelContainer: {
    flex: 1,
  },
  cardInput: {
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  cardText: {
    marginTop: 8,
    marginBottom: 5,
    marginLeft: 15,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
    fontSize: 12,
  },
  optionsContainer: {
    marginTop: 10,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  saveButton: {
    alignSelf: "center",
    width: 150,
    marginTop: 50,
    padding: 20,
    backgroundColor: Colors.accent_500,
    borderRadius: 20,
  },
  saveText: {
    textAlign: "center",
    fontSize: 18,
    color: Colors.white,
    fontFamily: Fonts.primary,
  },
  titleInputContainer: {
    borderColor: Colors.primary_700,
    borderRadius: 10,
    borderBottomWidth: 3,
    marginBottom: 40,
    marginTop: 20,
    backgroundColor: Colors.accent_500_30,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cardStack: {
    flexDirection: "row",
  },
  deleteContainer: {
    justifyContent: "center",
    paddingLeft: 50,
    borderRadius: 15,
    backgroundColor: Colors.red,
    width: 500,
    marginBottom: 10,
    marginLeft: 1,
  },
});
