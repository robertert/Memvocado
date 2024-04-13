import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

export default function App() {
  return (
    <Redirect href={"./authSignUp"}/>
  );
}
