import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts } from "../../constants/colors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Progress } from "tamagui";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import Divider from "../../ui/Divider";
import { PieChart } from "react-native-gifted-charts";
import Flashcard from "../../constants/Flashcard";
import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
  Grades,
} from "ts-fsrs";
import { UserContext } from "../../store/user-context";

const X_THRESHOLD = 0.25;
const Y_THRESHOLD = 0.2;

export default function learnScreen() {
  const params = useLocalSearchParams();
  const id = params.id;

  const safeArea = useSafeAreaInsets();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateXlInfo = useSharedValue(0);
  const translateXrInfo = useSharedValue(0);
  const translateYtInfo = useSharedValue(0);
  const translateYbInfo = useSharedValue(0);
  const rotateCard = useSharedValue(0);
  const opacityCard = useSharedValue(1);
  const tooltipSize = useSharedValue(-20);

  const translateYTabBar = useSharedValue(0);

  const dimensions = Dimensions.get("screen");

  const userCtx = useContext(UserContext);

  const TOP = -dimensions.height + 200;

  const [tabBarValue, setTabBarValue] = useState(0);
  const [progress, setProgress] = useState({
    easy: 0,
    hard: 0,
    good: 0,
    wrong: 0,
    todo: 10,
    all: 20,
  });
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBack, setIsBack] = useState(false);
  const [tooltip, setTooltip] = useState({ shown: false });
  const [time, setTime] = useState();
  const [index, setIndex] = useState(0);
  const [doneCards, setDoneCards] = useState([]);
  const [deck, setDeck] = useState({});
  const [isNew, setIsNew] = useState(false);

  const params1 = generatorParameters({
    enable_fuzz: false,
    w: [
      0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
      0.34, 1.26, 0.29, 2.61,
    ],
  });
  const f = fsrs(params1);
  const now = new Date();

  useEffect(() => {
    if (tooltip.shown) {
      clearTimeout(time);
      tooltipSize.value = withSpring(20);
      setTime(
        setTimeout(() => {
          setTooltip((prev) => {
            const newVal = { ...prev };
            newVal.shown = false;
            return newVal;
          });
        }, 2000)
      );
    } else {
      setTime(undefined);
      tooltipSize.value = withSpring(-20);
    }
  }, [tooltip]);
  useAnimatedReaction(
    () => {
      return {
        l: translateXlInfo.value,
        r: translateXrInfo.value,
        t: translateYtInfo.value,
        b: translateYbInfo.value,
      };
    },
    (newValue, previousValue) => {
      if (newValue.r < -30) {
        translateXrInfo.value = -30;
      }
      if (newValue.l > 30) {
        translateXlInfo.value = 30;
      }
      if (newValue.b < -30 - safeArea.bottom) {
        translateYbInfo.value = -30 - safeArea.bottom;
      }
      if (newValue.t > 30 + safeArea.top) {
        translateYtInfo.value = 30 + safeArea.top;
      }
    },
    [translateXlInfo, translateXrInfo, translateYtInfo, translateYbInfo]
  );

  useAnimatedReaction(
    () => {
      return translateX.value;
    },
    (newValue, previousValue) => {
      if (
        newValue >= dimensions.width + 50 ||
        newValue < -dimensions.width - 50
      ) {
        translateX.value = 0;
        translateY.value = 0;
      }
    },
    [translateX]
  );
  useAnimatedReaction(
    () => {
      return translateY.value;
    },
    (newValue, previousValue) => {
      if (
        newValue >= dimensions.height + 100 ||
        newValue < -dimensions.height - 100
      ) {
        translateX.value = 0;
        translateY.value = 0;
      }
    },
    [translateY]
  );

  useAnimatedReaction(
    () => {
      return rotateCard.value;
    },
    (newValue, previousValue) => {
      if (newValue == 180) {
        rotateCard.value = 0;
      }
    },
    [rotateCard]
  );
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {})
    .onChange((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      if (e.translationX > dimensions.width * X_THRESHOLD) {
        if (translateXrInfo.value > -30) {
          translateXrInfo.value =
            -(e.translationX - dimensions.width * X_THRESHOLD) / 2;
        }
      } else if (e.translationX != 0) {
        translateXrInfo.value = withSpring(0);
      }
      if (e.translationX < dimensions.width * -X_THRESHOLD) {
        if (translateXlInfo.value < 30) {
          translateXlInfo.value =
            (-e.translationX + dimensions.width * -X_THRESHOLD) / 2;
        }
      } else if (e.translationX != 0) {
        translateXlInfo.value = withSpring(0);
      }
      if (e.translationY > dimensions.height * Y_THRESHOLD) {
        if (translateYbInfo.value > -30 - safeArea.bottom) {
          translateYbInfo.value =
            -(e.translationY - dimensions.height * Y_THRESHOLD) / 2;
        }
      } else if (e.translationY != 0) {
        translateYbInfo.value = withSpring(0);
      }
      if (e.translationY < dimensions.height * -Y_THRESHOLD) {
        if (translateYtInfo.value < 30 + safeArea.top) {
          translateYtInfo.value =
            -(e.translationY + dimensions.height * Y_THRESHOLD) / 2;
        }
      } else if (e.translationY != 0) {
        translateYtInfo.value = withSpring(0);
      }
    })
    .onEnd((e) => {
      translateXlInfo.value = withSpring(0);
      translateXrInfo.value = withSpring(0);
      translateYbInfo.value = withSpring(0);
      translateYtInfo.value = withSpring(0);
      if (
        translateX.value < dimensions.width * X_THRESHOLD &&
        translateX.value > dimensions.width * -X_THRESHOLD &&
        translateY.value < dimensions.height * Y_THRESHOLD &&
        translateY.value > dimensions.height * -Y_THRESHOLD
      ) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else if (translateX.value <= dimensions.width * -X_THRESHOLD) {
        translateX.value = withSpring(-dimensions.width - 50);
        newCard("wrong");
      } else if (translateY.value <= dimensions.height * -Y_THRESHOLD) {
        translateY.value = withSpring(-dimensions.height - 200);
        newCard("easy");
      } else if (translateY.value >= dimensions.height * Y_THRESHOLD) {
        translateY.value = withSpring(dimensions.height + 200);
        newCard("hard");
      } else {
        translateX.value = withSpring(dimensions.width + 50);
        newCard("good");
      }
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateY: `${rotateCard.value}deg` },
        { rotate: `${(-0.6 * translateY.value + translateX.value) / 10}deg` },
      ],
      opacity: opacityCard.value,
    };
  });

  const lInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXlInfo.value }, { rotate: "90deg" }],
    };
  });
  const rInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXrInfo.value }, { rotate: "270deg" }],
    };
  });
  const tInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYtInfo.value }, { rotate: "0deg" }],
    };
  });
  const bInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateYbInfo.value }, { rotate: "0deg" }],
    };
  });

  const swipeUp = Gesture.Pan()
    .onBegin((e) => {})
    .onChange((e) => {
      if (e.translationY < 0 || translateYTabBar.value < 0) {
        translateYTabBar.value += e.changeY;
      }
    })
    .onEnd((e) => {
      if (e.translationY < TOP / 2 || translateYTabBar.value < TOP / 2) {
        translateYTabBar.value = withSpring(TOP);
      } else {
        translateYTabBar.value = withSpring(0);
      }
    });

  const tabBarStyle = useAnimatedStyle(() => {
    return {
      //transform: [{ translateY: translateYTabBar.value }],
      borderRadius: (translateYTabBar.value / (TOP / 2)) * 15,
    };
  });

  const insideStyles = useAnimatedStyle(() => {
    return {
      height: -translateYTabBar.value,
      opacity: translateYTabBar.value / (TOP / 2),
    };
  });

  const outsideStyles = useAnimatedStyle(() => {
    return {
      opacity: (TOP / 2 - translateYTabBar.value) / (TOP / 2),
    };
  });

  const bottomStyle = useAnimatedStyle(() => {
    return {
      zIndex: translateYTabBar.value < 0 ? 5 : 0,
    };
  });

  const insideDisplayStyles = useAnimatedStyle(() => {
    return {
      display: translateYTabBar.value < -10 ? "flex" : "none",
    };
  });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      setIsBack((prev) => !prev);
      rotateCard.value = withTiming(180);
      opacityCard.value = withSequence(withTiming(0.5), withTiming(1));
    });

  const comp = Gesture.Exclusive(pan, tap);

  const tooltipStyle = useAnimatedStyle(() => {
    return {
      padding: tooltipSize.value,
      display: tooltipSize.value < -10 ? "none" : "flex",
    };
  });

  ///////////////////////////////////////////////////////

  useEffect(() => {
    setTabBarValue(((progress.all - progress.todo) * 100) / progress.all);
    if (progress.all == 0) {
      router.replace({
        pathname: "./victoryScreen",
        params: { empty: true },
      });
    } else if (progress.todo == 0) {
      updateCards(doneCards);
      router.replace({
        pathname: "./victoryScreen",
        params: { ...progress, empty: false },
      });
    }
  }, [progress]);

  useEffect(() => {
    fetchCards();
  }, []);

  async function updateCards(doneCards) {
    try {
      setDoc(doc(db, `users/${userCtx.id}/decks/${id}`), deck);
      doneCards.forEach((card) => {
        setDoc(
          doc(db, `users/${userCtx.id}/decks/${id}/cards/${card.cardData.id}`),
          {
            cardAlgo: card.cardAlgo,
            cardData: card.cardData,
            firstLearn: card.firstLearn,
          }
        );
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function updateCardsEvery(card) {
    try {
      if (isNew) {
        setDoc(doc(db, `users/${userCtx.id}/decks/${id}`), deck);
        cards.forEach((card) => {
          setDoc(
            doc(
              db,
              `users/${userCtx.id}/decks/${id}/cards/${card.cardData.id}`
            ),
            {
              cardAlgo: card.cardAlgo ? card.cardAlgo : {},
              cardData: card.cardData,
              firstLearn: card.firstLearn ? card.firstLearn : {},
            }
          );
        });
      }
      setIsNew(false);
      setDoc(
        doc(db, `users/${userCtx.id}/decks/${id}/cards/${card.cardData.id}`),
        {
          cardAlgo: card.cardAlgo ? card.cardAlgo : {},
          cardData: card.cardData,
          firstLearn: card.firstLearn ? card.firstLearn : {},
        }
      );
    } catch (e) {
      console.log(e);
    }
  }

  function newCard(type) {
    const now = new Date();
    if (
      (cards[0].firstLearn.state == 1 && type == "good") ||
      type == "easy" ||
      !cards[0].firstLearn?.isNew
    ) {
      const newCrd = f.repeat(cards[0].cardAlgo, now);
      let ans;
      let newCardAlgo;
      switch (type) {
        case "wrong":
          ans = type;
          newCardAlgo = newCrd[Rating.Again].card;
          break;
        case "hard":
          ans = type;
          newCardAlgo = newCrd[Rating.Hard].card;
          break;
        case "good":
          newCardAlgo = newCrd[Rating.Good].card;
          break;
        case "easy":
          newCardAlgo = newCrd[Rating.Easy].card;
          break;
        default:
          newCardAlgo = newCrd[Rating.Manual].card;
          break;
      }
      if (cards[0].firstLearn.isNew && type == "good") {
        newCardAlgo = f.repeat(newCardAlgo, now)[Rating.Good].card;
      }

      let newDone;
      setCards((prev) => {
        let newVal = [...prev];
        newVal[0].firstLearn.isNew = false;
        newVal[0].firstLearn.isFirst = false;
        newVal[0].prevAns = ans;
        newVal[0].cardAlgo = newCardAlgo;
        newDone = newVal[0];

        if (newCardAlgo.due - now > 23 * 3600 * 1000 && newVal.length > 1) {
          newVal = newVal.slice(1);
        }

        newVal = newVal.sort(compDueDate);
        return newVal;
      });
      updateCardsEvery(newDone);
      if (newCardAlgo.due - now > 23 * 3600 * 1000) {
        setDoneCards((prev) => {
          const newVal1 = [...prev, newDone];
          return newVal1;
        });
      }
      setProgress((prev) => {
        const prevAns = cards[0].prevAns;
        const newVal = { ...prev };
        if (prevAns != type && prevAns) {
          newVal[type] += 1;
          newVal[prevAns] = Math.max(newVal[prevAns] - 1, 0);
        }
        if (!prevAns) {
          newVal[type] += 1;
        }

        if (newCardAlgo.due - now > 23 * 3600 * 1000) {
          newVal.todo -= 1;
        }
        return newVal;
      });
    } else {
      setCards((prev) => {
        let newVal = [...prev];
        newVal[0].firstLearn.isFirst = false;
        let now = new Date();
        switch (type) {
          case "good":
            newVal[0].firstLearn.due = new Date(now.getTime() + 1000 * 60 * 10);
            newVal[0].firstLearn.state = 1;
            break;
          case "hard":
            newVal[0].firstLearn.due = new Date(now.getTime() + 1000 * 60 * 5);
            newVal[0].firstLearn.state = 0;
            newVal[0].prevAns = type;
            break;
          case "wrong":
            newVal[0].firstLearn.state = 0;
            newVal[0].firstLearn.due = new Date(now.getTime() + 1000 * 60);
            newVal[0].prevAns = type;
            break;
          default:
            break;
        }
        updateCardsEvery(newVal[0]);
        newVal = newVal.sort(compDueDate);
        return newVal;
      });
      setProgress((prev) => {
        const prevAns = cards[0].prevAns;
        const newVal = { ...prev };
        if (prevAns != type && prevAns) {
          newVal[type] += 1;
          newVal[prevAns] = Math.max(newVal[prevAns] - 1, 0);
        }
        if (!prevAns) {
          newVal[type] += 1;
        }
        return newVal;
      });
    }
  }

  async function fetchCards() {
    try {
      const progressDecks = await getDoc(
        doc(db, `users/${userCtx.id}/decks/${id}`)
      );

      const newdeckData = await getDoc(doc(db, `decks/${id}`));
      const progressData = await getDocs(
        query(collection(db, `users/${userCtx.id}/decks/${id}/cards`))
      );
      const newDeckData = await getDocs(
        query(collection(db, `decks/${id}/cards`))
      );
      let deckData;
      let data;
      if (progressDecks.exists()) {
        setIsNew(false);
        data = progressData;
        deckData = progressDecks;
      } else {
        setIsNew(true);
        data = newDeckData;
        deckData = newdeckData;
      }
      setDeck(deckData.data());
      const newCardsDay = deckData.data().newCardsDay
        ? deckData.data().newCardsDay
        : 50;

      const readyCards = data.docs.map((doc) => {
        let cardSpaced;
        let firstLearn = doc.data().firstLearn
          ? doc.data().firstLearn
          : { isNew: false };
        if (!doc.data().cardAlgo || doc.data().cardAlgo?.last_review === 0) {
          if (!doc.data().firstLearn || doc.data().firstLearn?.isNew) {
            firstLearn = {
              due: new Date(),
              state: 0,
              isNew: true,
              isFirst: true,
            };
            if (doc.data().firstLearn) {
              firstLearn = doc.data().firstLearn;
            }
            cardSpaced = createEmptyCard();
            cardSpaced.last_review = 0;
          }
        } else {
          cardSpaced = doc.data().cardAlgo;
          cardSpaced.due = new Date(cardSpaced.due.seconds * 1000);
          cardSpaced.last_review = new Date(
            cardSpaced.last_review.seconds * 1000
          );
        }
        return {
          firstLearn: firstLearn,
          cardAlgo: cardSpaced,
          cardData: { id: doc.id, ...doc.data().cardData },
        };
      });
      const newCards = readyCards
        .filter((card) => card.firstLearn.isNew)
        .slice(0, newCardsDay);
      const dueCards = readyCards.filter(
        (card) =>
          !card.firstLearn.isFirst &&
          card.cardAlgo.due <
            now.getTime() -
              ((now.getTime() - now.getTimezoneOffset() * 60 * 1000) %
                (24 * 1000 * 3600))
      );
      const connectedCards = [...dueCards, ...newCards].sort(compDueDate);
      /*
      console.log(newCards);
      console.log("-----------------------");
      console.log(dueCards);
      console.log("-----------------------");
      console.log(connectedCards);
      */
      setCards(connectedCards);
      setProgress((prev) => {
        const newVal = { ...prev };
        newVal.all = connectedCards.length;
        newVal.todo = connectedCards.length;
        return newVal;
      });
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  }

  function compDueDate(a, b) {
    let a_due;
    if (a.firstLearn.isNew) {
      a_due = a.firstLearn.due;
    } else {
      a_due = a.cardAlgo.due;
    }
    let b_due;
    if (b.firstLearn.isNew) {
      b_due = b.firstLearn.due;
    } else {
      b_due = b.cardAlgo.due;
    }
    if (a.firstLearn.isFirst && b.firstLearn.isFirst) {
      return a_due - b_due;
    } else if (a.firstLearn.isFirst) {
      if (b_due < new Date().getTime()) {
        return 1;
      } else {
        return -1;
      }
    } else if (b.firstLearn.isFirst) {
      if (a_due < new Date().getTime()) {
        return -1;
      } else {
        return 1;
      }
    } else {
      return a_due - b_due;
    }
  }

  function goBackHandler() {
    router.back();
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
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size={"large"} color={Colors.primary_700} />
          </View>
        ) : (
          <>
            <GestureDetector gesture={comp}>
              <Animated.View
                style={[
                  styles.card,
                  rStyle,
                  {
                    zIndex: 2,
                    top: (dimensions.height * (1 - 0.65)) / 2,
                  },
                ]}
              >
                <Text style={[styles.cardText]}>
                  {!isBack ? cards[0].cardData.front : cards[0].cardData.back}
                </Text>
              </Animated.View>
            </GestureDetector>
            <View
              style={[
                styles.card,
                {
                  zIndex: 1,
                  top: (dimensions.height * (1 - 0.65)) / 2,
                },
              ]}
            ></View>
            <Animated.View
              style={[
                styles.infoLeft,
                {
                  width: dimensions.height,
                  zIndex: 3,
                  top: dimensions.height / 2,
                  left: -dimensions.height / 2 - 21,
                },
                lInfoStyle,
              ]}
            >
              <Text style={[styles.infoText, styles.leftInfoText]}>-</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.infoRight,
                {
                  width: dimensions.height,
                  zIndex: 3,
                  top: dimensions.height / 2,
                  right: -dimensions.height / 2 - 21,
                },
                rInfoStyle,
              ]}
            >
              <Text style={[styles.infoText, styles.rightInfoText]}>TEST</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.infoTop,
                {
                  width: dimensions.width,
                  zIndex: 3,
                  top: -60 - safeArea.top,
                  height: 60 + safeArea.top,
                },
                tInfoStyle,
              ]}
            >
              <Text style={[styles.infoText, styles.topInfoText]}>TEST</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.infoBottom,
                {
                  width: dimensions.width,
                  zIndex: 3,
                  bottom: -(60 + safeArea.bottom),
                  height: 60 + safeArea.bottom,
                },
                bInfoStyle,
              ]}
            >
              <Text style={[styles.infoText, styles.bottomInfoText]}>TEST</Text>
            </Animated.View>
            <View style={styles.top}>
              <Pressable onPress={goBackHandler}>
                <Ionicons
                  style={styles.backIcon}
                  name="chevron-back"
                  size={35}
                  color={Colors.primary_100}
                />
              </Pressable>
            </View>
            <Animated.View style={[styles.bottom, bottomStyle]}>
              <GestureDetector gesture={swipeUp}>
                <>
                  <Animated.View
                    style={[
                      tabBarStyle,
                      styles.bottomBar,
                      { paddingBottom: safeArea.bottom },
                    ]}
                  >
                    <Animated.View style={outsideStyles}>
                      <Progress unstyled height={10} value={tabBarValue}>
                        <Progress.Indicator animation={"bouncy"} />
                      </Progress>
                      <View style={styles.barTextContainer}>
                        <Text style={[styles.barText, { color: Colors.blue }]}>
                          {progress.easy}
                        </Text>
                        <Text style={[styles.barText, { color: Colors.green }]}>
                          {progress.good}
                        </Text>
                        <Text
                          style={[styles.barText, { color: Colors.yellow }]}
                        >
                          {progress.hard}
                        </Text>
                        <Text style={[styles.barText, { color: Colors.red }]}>
                          {progress.wrong}
                        </Text>
                        <Text style={styles.barText}>{progress.todo}</Text>
                      </View>
                    </Animated.View>
                    <Animated.View style={[styles.insideBar, insideStyles]}>
                      <Animated.View style={[{ flex: 1 }, insideDisplayStyles]}>
                        <View style={styles.insideRow}>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.blue }]}>
                              {progress.easy}
                            </Text>
                            <Text style={styles.desc}>Easy</Text>
                          </View>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.green }]}>
                              {progress.good}
                            </Text>
                            <Text style={styles.desc}>Good</Text>
                          </View>
                          <View style={styles.insideSection}>
                            <Text
                              style={[styles.num, { color: Colors.yellow }]}
                            >
                              {progress.hard}
                            </Text>
                            <Text style={styles.desc}>Hard</Text>
                          </View>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.red }]}>
                              {progress.wrong}
                            </Text>
                            <Text style={styles.desc}>Wrong</Text>
                          </View>
                        </View>
                        <View style={styles.insideRow}>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.white }]}>
                              {progress.all}
                            </Text>
                            <Text style={styles.desc}>All</Text>
                          </View>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.white }]}>
                              {progress.todo}
                            </Text>
                            <Text style={styles.desc}>To do</Text>
                          </View>
                          <View style={styles.insideSection}>
                            <Text style={[styles.num, { color: Colors.white }]}>
                              {Math.ceil(
                                ((progress.all - progress.todo) * 100) /
                                  progress.all
                              )}
                              %
                            </Text>
                            <Text style={styles.desc}>done</Text>
                          </View>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <Progress
                            style={styles.progressBar}
                            value={tabBarValue}
                          >
                            <Progress.Indicator
                              animation={"bouncy"}
                            ></Progress.Indicator>
                          </Progress>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.chartContainer}>
                          <Text style={styles.chartTitle}>
                            Current state chart
                          </Text>
                          <PieChart
                            data={[
                              {
                                value: progress.easy,
                                color: Colors.blue,
                                text: "Easy",
                                textColor: Colors.secBlue,
                              },
                              {
                                value: progress.good,
                                color: Colors.green,
                                text: "Good",
                                textColor: Colors.secGreen,
                              },
                              {
                                value: progress.hard,
                                color: Colors.yellow,
                                text: "Hard",
                                textColor: Colors.secYellow,
                              },
                              {
                                value: progress.wrong,
                                color: Colors.red,
                                text: "Wrong",
                                textColor: Colors.secRed,
                              },
                              {
                                value: progress.todo,
                                color: Colors.primary_100,
                                text: "Rest",
                                textColor: Colors.primary_500,
                              },
                            ]}
                            onPress={(item) => {
                              setTooltip({ ...item, shown: true });
                            }}
                          />
                          <Animated.View
                            style={[
                              styles.tooltip,
                              tooltipStyle,
                              {
                                backgroundColor: tooltip.color,
                                borderColor: tooltip.textColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tooltipText,
                                { color: tooltip.textColor },
                              ]}
                            >
                              {tooltip.text}
                            </Text>
                          </Animated.View>
                        </View>
                      </Animated.View>
                    </Animated.View>
                  </Animated.View>
                </>
              </GestureDetector>
            </Animated.View>
          </>
        )}
      </GestureHandlerRootView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.primary_700,
    borderRadius: 40,
    height: "65%",
    width: "70%",
    backgroundColor: Colors.primary_100,
    position: "absolute",
  },
  infoText: {
    fontSize: 20,
    fontFamily: Fonts.primary,
  },
  infoLeft: {
    backgroundColor: Colors.red,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 100,
    position: "absolute",
  },
  leftInfoText: {
    color: Colors.white,
  },
  infoRight: {
    backgroundColor: Colors.green,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 100,
    position: "absolute",
  },
  rightInfoText: {
    color: Colors.white,
  },
  infoBottom: {
    backgroundColor: Colors.yellow,
    height: 42,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 5,
    position: "absolute",
  },
  bottomInfoText: {
    color: Colors.white,
  },
  infoTop: {
    backgroundColor: Colors.blue,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    justifyContent: "flex-end",
    paddingBottom: 5,
    position: "absolute",
  },
  topInfoText: {
    color: Colors.white,
  },
  backIcon: {
    alignSelf: "flex-start",
  },
  top: {
    alignItems: "flex-start",
    width: "100%",
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
  },
  bottomBar: {
    zIndex: 10,
    width: "100%",
    backgroundColor: Colors.grey,
  },
  barText: {
    fontFamily: Fonts.primary,
    color: Colors.white,
    fontSize: 22,
  },
  barTextContainer: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  insideBar: {
    color: Colors.grey,
  },
  cardText: {
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
    fontSize: 30,
  },
  insideRow: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-around",
  },
  insideSection: {
    alignItems: "center",
  },
  desc: {
    fontFamily: Fonts.primary,
    fontSize: 20,
    color: Colors.white,
  },
  num: {
    fontFamily: Fonts.primary,
    fontSize: 30,
  },
  divider: {
    width: "90%",
    height: 1,
    marginVertical: 10,
    backgroundColor: Colors.white,
    alignSelf: "center",
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.grey,
  },
  chartContainer: {
    flex: 1,
    alignItems: "center",
  },
  tooltip: {
    backgroundColor: Colors.grey,
    position: "absolute",
    padding: 20,
    borderRadius: 15,
    alignSelf: "center",
    top: 120,
    borderWidth: 2,
  },
  tooltipText: {
    color: Colors.white,
    fontFamily: Fonts.primary,
  },
  chartTitle: {
    marginTop: 20,
    marginBottom: 40,
    fontFamily: Fonts.primary,
    fontSize: 30,
    color: Colors.white,
  },
});
