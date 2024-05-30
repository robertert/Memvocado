import { Tabs } from "expo-router";
import { Colors } from "../../constants/colors";
import {
  MaterialCommunityIcons,
  Entypo,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const sizeC = 32;
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarInactiveTintColor: Colors.primary_700,
        tabBarActiveTintColor: Colors.accent_500,
        headerShown: false,
        tabBarBackground: () => {
          return (
            <View
              style={[
                styles.tabBar,
                { height: insets.bottom + 70, paddingBottom: insets.bottom },
              ]}
            >
              <View style={styles.tabBarInner} />
            </View>
          );
        },
      }}
    >
      <Tabs.Screen
        name="decksScreen"
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <>
                <MaterialCommunityIcons
                  name="cards"
                  size={sizeC}
                  color={color}
                />
                {focused && (
                  <View style={[styles.line, { backgroundColor: color }]} />
                )}
              </>
            );
          },
        }}
      />

      <Tabs.Screen
        name="marketplaceScreen"
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <>
                <Entypo name="shop" size={sizeC} color={color} />
                {focused && (
                  <View style={[styles.line, { backgroundColor: color }]} />
                )}
              </>
            );
          },
        }}
      />
      <Tabs.Screen
        name="createScreen"
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <>
                <AntDesign
                  name={!focused ? "pluscircleo" : "pluscircle"}
                  size={sizeC}
                  color={color}
                />
                {focused && (
                  <View style={[styles.line, { backgroundColor: color }]} />
                )}
              </>
            );
          },
        }}
      />
      <Tabs.Screen
        name="statsScreen"
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <>
                <Ionicons name="stats-chart" size={sizeC} color={color} />
                {focused && (
                  <View style={[styles.line, { backgroundColor: color }]} />
                )}
              </>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profileScreen"
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <>
                <Ionicons name="person" size={sizeC} color={color} />
                {focused && (
                  <View style={[styles.line, { backgroundColor: color }]} />
                )}
              </>
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarInner: {
    flex: 1,
  },
  tabBar: {
    borderRadius: 0,
    width: "100%",
    height: 70,
    backgroundColor: Colors.primary_500,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    marginTop: 3,
    height: 2,
    width: "70%",
    borderRadius: 10,
  },
});
