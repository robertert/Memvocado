import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, generageRandomUid } from "../../constants/colors";
import { Image, ScrollView, View } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function deckDetails() {
  const safeArea = useSafeAreaInsets();

  const [deck, setDeck] = useState({
    title: "English",
    views: "10k",
    likes: 100,
    cards: 124,
    userId: generageRandomUid(),
    userName: "Robert",
    done: 12,
    today: 90,
    new: 120,
  });
  const [cards, setCards] = useState([
    {
      id: generageRandomUid(),
      front: "t",
      back: "t",
    },
  ]);
  const [dateAgo, setDateAgo] = useState("2 weeks ago");

  function renderCard(itemData) {
    const item = itemData.item;
    return (
      <LinearGradient
        style={styles.cardContainer}
        colors={[Colors.lightGreen, Colors.primary_700]}
      >
        <Text style={styles.cardText}>{item.front}</Text>
      </LinearGradient>
    );
  }
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      style={styles.background}
      colors={[Colors.primary_500, Colors.primary_100]}
    >
      <View style={[styles.container, { paddingTop: safeArea.top + 8 }]}>
        <View style={styles.listContainer}>
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            horizontal
          />
        </View>
        <Text style={styles.title}>{deck.title}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statContainer}>
            <Text style={styles.numText}>{deck.views}</Text>
            <Entypo name="eye" size={35} color={Colors.blue} />
          </View>
          <View style={styles.statContainer}>
            <Text style={styles.numText}>{deck.cards}</Text>
            <MaterialCommunityIcons
              name="cards"
              size={35}
              color={Colors.yellow}
            />
          </View>
          <View style={styles.statContainer}>
            <Text style={styles.numText}>{deck.likes}</Text>
            <AntDesign name="heart" size={35} color={Colors.red} />
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.userContainer}>
            <Image
              source={require("../../assets/memvocadoicon.png")}
              style={styles.image}
            />
            <Text style={styles.nameText}>{deck.userName}</Text>
          </View>
          <Text style={styles.dateText}>{dateAgo}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.title}>Your progress</Text>
          <LinearGradient
            style={styles.progressSubcontainer}
            colors={["#00000000"]}
          >
            <View style={styles.progressValueContainer}>
              <Text style={styles.progressNumText}>{deck.done}</Text>
              <Text style={styles.progressInfoText}>Done</Text>
            </View>
            <View style={styles.progressValueContainer}>
              <Text style={styles.progressNumText}>{deck.new}</Text>
              <Text style={styles.progressInfoText}>New</Text>
            </View>
            <View style={styles.progressValueContainer}>
              <Text style={styles.progressNumText}>{deck.today}</Text>
              <Text style={styles.progressInfoText}>Today</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
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
  cardContainer: {
    marginHorizontal: 5,
    height: 250,
    width: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: Colors.primary_700,
  },
  cardText: {
    textAlign: "center",
    fontSize: 18,
    color: Colors.primary_100,
    fontFamily: Fonts.primary,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  listContainer: {
    marginTop: 20,
    justifyContent: "center",
    height: 250,
    marginBottom: 20,
  },
  statsContainer: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  numText: {
    marginRight: 10,
    textAlign: "center",
    fontSize: 25,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  infoContainer: {
    width: "100%",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 40,
  },
  nameText: {
    fontSize: 15,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  dateText: {
    fontSize: 15,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
    marginRight: 10,
  },
  progressContainer: {
    width: "100%",
    marginTop: 30,
    alignItems: "center",
  },
  progressSubcontainer: {
    borderWidth: 2,
    borderColor: Colors.accent_500,
    marginTop: 20,
    width: "80%",
    paddingVertical: 30,
    borderRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  progressValueContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressInfoText: {
    fontSize: 15,
    color: Colors.accent_500,
    fontFamily: Fonts.primary,
  },
  progressTitleText: {
    fontSize: 23,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  progressNumText: {
    fontSize: 25,
    color: Colors.accent_500,
    fontFamily: Fonts.primary,
  },
});
