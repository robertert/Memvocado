import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, Fonts } from "../../constants/colors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Input } from "tamagui";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { router } from "expo-router";

export default function authLogin() {
  const safeArea = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function logInHandler() {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      console.log(res.user);
    } catch (e) {
      console.log(e.code);
      if (
        e.code == "auth/invalid-email" ||
        e.code == "auth/missing-password" ||
        e.code == "auth/invalid-credential"
      ) {
        setMessage("Invalid email or password");
      }
    }
  }

  function emailChanged(text) {
    setEmail(text);
  }
  function passwordChanged(text) {
    setPassword(text);
  }

  function createHander() {
    router.navigate("./authSignUp");
  }
  function forgotPassHandler() {
    router.navigate("./resetPassword");
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      style={styles.background}
      colors={[Colors.primary_500, Colors.primary_100]}
    >
      <View style={[styles.container, { paddingTop: safeArea.top }]}>
        <View style={styles.topConatainer}>
          <Image
            src={require("../../assets/memvocadoicon.png")}
            style={styles.icon}
          />
          <Text style={styles.title}>Memvocado</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={emailChanged}
                value={email}
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={passwordChanged}
                value={password}
                style={styles.input}
              />
            </View>
          </View>
          {message && <Text style={styles.errorMessage}>{message}</Text>}
          <Pressable onPress={logInHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Log in</Text>
            </View>
          </Pressable>
          <Pressable onPress={forgotPassHandler}>
            <Text style={styles.info}>
              Did you forgot your password? Click here
            </Text>
          </Pressable>
          <Pressable onPress={createHander}>
            <Text style={styles.info}>
              Don't have an account? Create new one
            </Text>
          </Pressable>
        </View>
      </View>
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
  topConatainer: {
    alignItems: "center",
  },
  icon: {
    marginTop: 100,
    height: 150,
    width: 150,
  },
  title: {
    fontSize: 50,
    color: Colors.primary_700,
    fontFamily: Fonts.primary,
  },
  label: {
    fontSize: 18,
    fontFamily: Fonts.primary,
    color: Colors.primary_700,
    marginBottom: 5,
  },
  labelContainer: {
    marginVertical: 10,
  },
  formContainer: {
    width: "70%",
    marginTop: 30,
  },
  inputContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary_500,
    borderRadius: 100,
  },
  input: {
    width: "80%",
    fontSize: 18,
    color: Colors.primary_700,
    fontFamily: Fonts.secondary,
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: Colors.accent_500,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: Fonts.primary,
    color: Colors.white,
  },
  info: {
    fontSize: 15,
    color: Colors.primary_700,
    fontFamily: Fonts.secondary,
    marginVertical: 5,
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    color: "red",
    fontFamily: Fonts.secondary,
  },
});
