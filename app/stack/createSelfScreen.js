import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, generageRandomUid } from "../../constants/colors";
import { View } from "tamagui";
import { useContext, useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "@tamagui/linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { FontAwesome5 } from "@expo/vector-icons";
import NewCard from "../../ui/newCard";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { router, useLocalSearchParams } from "expo-router";
import { Overlay } from "@rneui/themed";
import { UserContext } from "../../store/user-context";
import { ScrollView } from "react-native-gesture-handler";

export default function createSelfScreen() {
  const safeArea = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [cards, setCards] = useState([
    {
      id: "test",
      front: "",
      back: "",
      isMoreFront: false,
      isMoreBack: false,
      tags: [],
    },
    {
      id: "test1",
      front: "",
      back: "",
      isMoreFront: false,
      isMoreBack: false,
      tags: [],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [isTagsShown, setIsTagsShown] = useState(false);
  const [tagCard, setTagCard] = useState({});
  const [newTag, setNewTag] = useState("");

  const userCtx = useContext(UserContext);

  useEffect(() => {
    if (params.cards) {
      const gotCards = JSON.parse(params.cards).map((card) => {
        card = {
          ...card,
          id: generageRandomUid(),
          tags: [],
          isMoreFront: false,
          isMoreBack: false,
        };
        return card;
      });
      setCards(gotCards);
    }
  }, []);
  async function saveHandler() {
    try {
      setIsLoading(true);
      const promises = [];

      const docu = await addDoc(collection(db, `decks`), {
        title: title,
        cardsNum: cards.length,
      });
      cards.forEach((card) => {
        promises.push(
          addDoc(collection(db, `decks/${docu.id}/cards`), {
            cardData: {
              front: card.front,
              back: card.back,
              tags: card.tags ? card.tags : [],
            },
          })
        );
      });
      promises.push(
        updateDoc(doc(db, `users/${userCtx.id}`), {
          decks: arrayUnion(docu.id),
        })
      );
      await Promise.all(promises);
      router.back();
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  function createNewHandler() {
    setCards((prev) => {
      return [
        ...prev,
        {
          id: generageRandomUid(),
          front: "",
          back: "",
          isMoreFront: false,
          isMoreBack: false,
        },
      ];
    });
  }

  function titleChangeHandler(text) {
    setTitle(text);
  }

  function tagsShownHandler(card) {
    setIsTagsShown((prev) => !prev);
    setTagCard(card);
  }

  function tagChangeHandler(text) {
    setNewTag(text);
  }

  function newTagHandler() {
    setCards((prev) => {
      let newCards = [...prev];
      newCards = newCards.map((card) => {
        if (card.id === tagCard.id) {
          if (card.tags) {
            card.tags.push(newTag);
          } else {
            card.tags = [newTag];
          }
        }
        return card;
      });
      return newCards;
    });

    setNewTag("");
  }

  function delTagHandler(delTag) {
    setCards((prev) => {
      let newCards = [...prev];
      newCards = newCards.map((card) => {
        if (card.id === tagCard.id) {
          card.tags = card.tags.filter((tag) => tag != delTag);
        }
        return card;
      });
      return newCards;
    });
  }

  return (
    <GestureHandlerRootView>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        style={styles.background}
        colors={[Colors.primary_500, Colors.primary_100]}
      >
        <View style={[styles.container, { paddingTop: safeArea.top + 8 }]}>
          {isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator
                size={"large"}
                color={Colors.accent_500}
                style={{ alignSelf: "center" }}
              />
            </View>
          ) : (
            <ScrollView style={{ flex: 1, width: "100%" }}>
              <Text style={styles.titleLabel}>Title</Text>
              <View style={styles.titleInputContainer}>
                <TextInput
                  style={styles.titleInput}
                  onChangeText={titleChangeHandler}
                  value={title}
                />
              </View>
              {cards.map((card) => {
                return (
                  <NewCard
                    card={card}
                    setCards={setCards}
                    tagsShownHandler={tagsShownHandler}
                  />
                );
              })}
              <Pressable onPress={createNewHandler}>
                <AntDesign
                  name="pluscircle"
                  size={45}
                  color={Colors.accent_500}
                  style={styles.plusIcon}
                />
              </Pressable>
              <Pressable onPress={saveHandler}>
                <View style={styles.saveButton}>
                  <Text style={styles.saveText}>Create</Text>
                </View>
              </Pressable>
            </ScrollView>
          )}
          <Overlay
            isVisible={isTagsShown}
            onBackdropPress={tagsShownHandler}
            overlayStyle={styles.dialogContainer}
          >
            <Text style={styles.tagsTitle}>Tags:</Text>
            <ScrollView style={styles.scrollOverlay}>
              {(cards.filter((card) => card.id === tagCard.id)[0]?.tags
                ? cards.filter((card) => card.id === tagCard.id)[0].tags
                : []
              ).map((itemData) => {
                return (
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagsText}>{itemData}</Text>
                    <Pressable onPress={delTagHandler.bind(this, itemData)}>
                      <FontAwesome5
                        name="trash"
                        size={24}
                        color={Colors.accent_500}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.newTagContainer}>
              <View style={styles.tagInputContainer}>
                <TextInput
                  onChangeText={tagChangeHandler}
                  value={newTag}
                  style={styles.tagInput}
                />
              </View>
              <Pressable onPress={newTagHandler}>
                <AntDesign
                  name="pluscircle"
                  size={25}
                  color={Colors.accent_500}
                  style={styles.plusIcon}
                />
              </Pressable>
            </View>
          </Overlay>
        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
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
  titleInput: {
    textAlign: "center",
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
    fontSize: 25,
  },
  titleLabel: {
    textAlign: "center",
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
    fontSize: 25,
  },

  plusIcon: {
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  cardStack: {
    flexDirection: "row",
  },
  deleteContainer: {
    borderRadius: 15,
    backgroundColor: Colors.red,
    width: 500,
    marginBottom: 10,
    marginLeft: 1,
  },
  dialogContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: Colors.primary_500,
    maxHeight: 500,
  },
  tagsTitle: {
    fontFamily: Fonts.primary,
    color: Colors.primary_700,
    fontSize: 23,
  },
  tagsText: {
    fontFamily: Fonts.primary,
    color: Colors.accent_500,
    fontSize: 21,
  },
  tagInputContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.accent_500_30,
    borderRadius: 10,
    marginRight: 15,
  },
  tagInput: {
    color: Colors.primary_700,
    fontFamily: Fonts.secondary,
  },
  newTagContainer: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  scrollOverlay: {
    marginTop: 15,
    width: "100%",
    borderRadius: 15,
    backgroundColor: Colors.accent_500_30,
    paddingHorizontal: 10,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
});
