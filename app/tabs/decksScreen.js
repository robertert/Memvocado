import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Colors, Fonts, generageRandomUid } from "../../constants/colors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import { Image, ScrollView } from "tamagui";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserContext } from "../../store/user-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function decksScreen() {
  const safeArea = useSafeAreaInsets();

  const [decks, setDecks] = useState([]);
  const [pinned, setPinned] = useState([1, 2, 3]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);

  const userCtx = useContext(UserContext);

  useEffect(() => {
    fetchDecks();
  }, []);

  async function fetchDecks() {
    try {
      setIsLoading(true);

      const readyDecks = [];
      const readyPinned = [];
      const data = await getDoc(doc(db, `users/${userCtx.id}`));
      const decksIds = data.data().decks;

      const pinnedIds = data.data().pinned;

      const promises = decksIds.map(async (deck) => {
        const deckData = await getDoc(doc(db, `decks/${deck}`));
        readyDecks.push({
          id: deckData.id,
          views: 0,
          likes: 0,
          ...deckData.data(),
        });
      });

      const promises2 = pinnedIds.map(async (deck) => {
        const deckData = await getDoc(doc(db, `decks/${deck}`));
        readyPinned.push({
          id: deckData.id,
          views: 0,
          likes: 0,
          ...deckData.data(),
        });
      });

      await Promise.all([...promises, ...promises2]);
      setDecks(readyDecks);
      setPinned(readyPinned);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Try again later");
    }
  }

  function pinnedPressed(id) {
    router.push("../stack/deckDetails");
    return;
    router.push({
      pathname: "../stack/learnScreen",
      params: { id: pinned[id].id },
    });
  }

  function openDeckHandler(gotDeck) {
    router.push({
      pathname: "../stack/learnScreen",
      params: { id: gotDeck.id },
    });
  }
  function savedHandeler(gotDeck) {
    setDecks((prev) => {
      let newVal = [...prev];
      newVal = newVal.map((deck) => {
        if (gotDeck.id === deck.id) {
          deck.saved = !deck.saved;
        }
        return deck;
      });
      return newVal;
    });
  }

  function shorten(text) {
    if (text) {
      if (text.length < 10) {
        return text;
      } else {
        return text.slice(0, 8) + "...";
      }
    } else {
      return "";
    }
  }

  async function refreshHandler() {
    setIsRefresh(true);
    await fetchDecks();
    setIsRefresh(false);
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      style={styles.background}
      colors={[Colors.primary_500, Colors.primary_100]}
    >
      <GestureHandlerRootView
        style={[styles.container, { paddingTop: safeArea.top + 8 }]}
      >
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 100 }}
            color={Colors.accent_500}
            size={"large"}
          />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isRefresh}
                onRefresh={refreshHandler}
              />
            }
            style={{ flex: 1, width: "100%" }}
          >
            <View style={styles.pinnedContainer}>
              {pinned.length > 0 && (
                <Pressable onPress={pinnedPressed.bind(this, 0)}>
                  <View style={styles.pinnedDeck}>
                    <View style={styles.pinnedDeckTop}>
                      <AntDesign
                        name="pushpin"
                        style={styles.pin}
                        size={20}
                        color={Colors.primary_100}
                      />
                      <Image
                        source={require("../../assets/icon.png")}
                        style={styles.pinnedIcon}
                      />
                    </View>

                    <Text style={styles.pinnedDeckText}>
                      {shorten(pinned[0].title)}
                    </Text>
                  </View>
                </Pressable>
              )}
              {pinned.length > 1 && (
                <Pressable onPress={pinnedPressed.bind(this, 1)}>
                  <View style={styles.pinnedDeck}>
                    <View style={styles.pinnedDeckTop}>
                      <AntDesign
                        name="pushpin"
                        style={styles.pin}
                        size={20}
                        color={Colors.primary_100}
                      />
                      <Image
                        source={require("../../assets/icon.png")}
                        style={styles.pinnedIcon}
                      />
                    </View>
                    <Text style={styles.pinnedDeckText}>
                      {shorten(pinned[1].title)}
                    </Text>
                  </View>
                </Pressable>
              )}
              {pinned.length > 2 && (
                <Pressable onPress={pinnedPressed.bind(this, 2)}>
                  <View style={styles.pinnedDeck}>
                    <View style={styles.pinnedDeckTop}>
                      <AntDesign
                        name="pushpin"
                        style={styles.pin}
                        size={20}
                        color={Colors.primary_100}
                      />
                      <Image
                        source={require("../../assets/icon.png")}
                        style={styles.pinnedIcon}
                      />
                    </View>
                    <Text style={styles.pinnedDeckText}>
                      {shorten(pinned[2].title)}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
            <View style={styles.decksList}>
              {decks.map((deck) => {
                return (
                  <Pressable onPress={openDeckHandler.bind(this, deck)}>
                    <View style={styles.deckContainer}>
                      <View style={styles.topDeckContainer}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.deckTextTitle}>{deck.title}</Text>
                        </View>
                        <View style={styles.topRightDeckContainer}>
                          <Text style={styles.deckTextRest}>{deck.author}</Text>
                          <Pressable onPress={savedHandeler.bind(this, deck)}>
                            {deck.saved ? (
                              <FontAwesome
                                name="bookmark"
                                size={24}
                                color={Colors.accent_500}
                              />
                            ) : (
                              <FontAwesome
                                name="bookmark-o"
                                size={24}
                                color={Colors.accent_500}
                              />
                            )}
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.bottomDeckContainer}>
                        <View style={styles.infoDeckContainer}>
                          <Text style={styles.numTextDeck}>{deck.likes}</Text>
                          <FontAwesome
                            name="heart"
                            size={24}
                            color={Colors.red}
                          />
                        </View>
                        <View style={styles.infoDeckContainer}>
                          <Text style={styles.numTextDeck}>{deck.views}</Text>
                          <FontAwesome5
                            name="eye"
                            size={24}
                            color={Colors.blue}
                          />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </GestureHandlerRootView>
    </LinearGradient>
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
  pinnedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pinnedDeck: {
    backgroundColor: Colors.primary_700,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginLeft: 10,
    alignItems: "center",
  },
  pinnedDeckText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: Fonts.primary,
    color: Colors.primary_100,
  },
  pin: {},
  pinnedDeckTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinnedIcon: {
    height: 35,
    width: 35,
    borderRadius: 17.5,
    marginLeft: 20,
  },
  deckContainer: {
    paddingVertical: 20,
    borderRadius: 15,
    backgroundColor: Colors.primary_100,
    marginVertical: 10,
  },
  topDeckContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  bottomDeckContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingRight: 40,
  },
  deckTextTitle: {
    fontSize: 22,
    marginLeft: 20,
    fontFamily: Fonts.primary,
    color: Colors.primary_700,
  },
  deckTextRest: {
    marginRight: 15,
    fontFamily: Fonts.primary,
    color: Colors.primary_700,
  },
  topRightDeckContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  decksList: {
    marginTop: 20,
    flex: 1,
  },
  numTextDeck: {
    marginRight: 10,
    fontFamily: Fonts.primary,
    color: Colors.primary_700,
    fontSize: 20,
  },
  infoDeckContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
