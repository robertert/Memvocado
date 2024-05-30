import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { Colors, Fonts } from "../../constants/colors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function marketplaceScreen() {
  const safeArea = useSafeAreaInsets();

  async function newFlashcard() {
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      style={styles.background}
      colors={[Colors.primary_500, Colors.primary_100]}
    >
      <View style={[styles.container, { paddingTop: safeArea.top + 8 }]}>
        <Pressable onPress={newFlashcard}>
          <View>
            <Text>TEST</Text>
          </View>
        </Pressable>
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
  restartButton: {
    marginTop: 50,
    padding: 20,
    backgroundColor: Colors.accent_500,
    borderRadius: 20,
  },
  restartText: {
    color: Colors.white,
    fontFamily: Fonts.primary,
  },
  insideRow: {
    width: "100%",
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
    color: Colors.primary_700,
  },
  num: {
    fontFamily: Fonts.primary,
    fontSize: 30,
  },
  title: {
    textAlign: "center",
    fontFamily: Fonts.primary,
    color: Colors.primary_100,
    fontSize: 35,
    marginHorizontal: 20,
    marginTop: 30,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: Fonts.primary,
    color: Colors.primary_100,
    fontSize: 27,
    marginHorizontal: 28,
    marginBottom: 20,
  },
});
