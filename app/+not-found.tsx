import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/Colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.message}>Unmatched Route</Text>
        <Text style={styles.subtext}>The page you are looking for does not exist.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.accent,
    padding: 32,
    borderRadius: 0,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.accent,
    fontFamily: colors.pixelFont,
    marginBottom: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  message: {
    fontSize: 22,
    color: colors.text,
    fontFamily: colors.pixelFont,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 16,
    color: colors.textAccent,
    fontFamily: colors.pixelFont,
    textAlign: 'center',
    marginTop: 8,
  },
});
