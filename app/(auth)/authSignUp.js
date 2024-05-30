import { StatusBar } from "expo-status-bar";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Fonts } from "../../constants/colors";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "tamagui";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { UserContext } from "../../store/user-context";
import Spinner from "react-native-loading-spinner-overlay";

const randomName = `user${Math.random() * 100 + Date.now()}`;

export default function authSignin() {
  const safeArea = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [invalidConfirmPassword, setInvalidConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  const userCtx = useContext(UserContext);

  async function authent(user) {
    const data = await getDocs(
      query(collection(db, `users`), where("email", "==", user.email))
    );
    const userData = { id: data.docs[0].id, ...data.docs[0].data() };
    userCtx.getUser(userData.name, userData.id);
  }

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        await authent(user);
        router.replace("../tabs");
      } else {
        setIsFirstLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    let time;
    if (isLoading) {
      time = setTimeout(() => {
        Alert.alert("Oops", "Something went wrong");
        setIsLoading(false);
      }, 10000);
    }
    return () => clearTimeout(time);
  }, [isLoading]);

  async function signUpHandler() {
    if (validateRegister()) {
      try {
        setIsLoading(true);
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = await addDoc(collection(db, "users"), {
          name: randomName,
          email: email,
          friends: [],
          pending: [],
          incoming: [],
          achivements: [],
          permissions: [],
          settings: {
            language: "en",
            allowNotifications: true,
          },
          lastLogin: new Date(),
          createdAt: new Date(),
        });
        userCtx.getUser(randomName, newUser.id);
        setIsLoading(false);
        router.replace("./signUp2");
      } catch (e) {
        if (e.code === "auth/invalid-email") {
          setMessage("Invalid email");
        }
        if (e.code === "auth/email-already-in-use") {
          setMessage("Email already used");
        }
        console.log(e.code);
      }
    }
  }

  function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  function validateRegister() {
    if (!email.includes("@") || !email.includes(".")) {
      setInvalidEmail(true);
      setMessage("Invalid email");
      return false;
    }
    if (password.trim().length < 8) {
      setInvalidPassword(true);
      setMessage("Password should contain at least 8 characters");
      return false;
    }
    if (password.trim() != confirmPassword.trim()) {
      setInvalidConfirmPassword(true);
      setMessage("Password don't match");
      return false;
    }

    return true;
  }

  function emailChanged(text) {
    setInvalidEmail(false);
    setMessage("");
    setEmail(text);
  }
  function passwordChanged(text) {
    setInvalidPassword(false);
    setMessage("");
    setPassword(text);
  }
  function confirmPasswordChanged(text) {
    setInvalidConfirmPassword(false);
    setMessage("");
    setConfirmPassword(text);
  }

  function logInHandler() {
    router.replace("./authLogin");
  }
  if (isFirstLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.primary_100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={require("../../assets/memvocadoicon.png")}
          style={{ height: 200, width: 200 }}
        />
      </View>
    );
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
            <View
              style={[
                styles.inputContainer,
                invalidEmail && styles.invalidContainer,
              ]}
            >
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
            <View
              style={[
                styles.inputContainer,
                invalidPassword && styles.invalidContainer,
              ]}
            >
              <TextInput
                onChangeText={passwordChanged}
                value={password}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Confirm password</Text>
            <View
              style={[
                styles.inputContainer,
                invalidConfirmPassword && styles.invalidContainer,
              ]}
            >
              <TextInput
                onChangeText={confirmPasswordChanged}
                value={confirmPassword}
                style={styles.input}
              />
            </View>
          </View>
          {message && <Text style={styles.errorMessage}>{message}</Text>}
          <Pressable onPress={signUpHandler}>
            <View style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Sign up</Text>
            </View>
          </Pressable>
          <Pressable onPress={logInHandler}>
            <Text style={styles.info}>Already have an account? Log in</Text>
          </Pressable>
        </View>
        <Spinner visible={isLoading} />
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
    marginTop: 50,
    height: 150,
    width: 150,
  },
  title: {
    fontSize: 55,
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
  invalidContainer: {
    borderWidth: 2,
    borderColor: "red",
  },
});
