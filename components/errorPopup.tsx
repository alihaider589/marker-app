import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../constants/Colors";

interface ErrorPopupProps {
  open: boolean;
  onClose: () => void;
  errorMessage?: string;
  type?: "error" | "success";
}
export default function ErrorPopup({
  open,
  errorMessage,
  onClose,
  type = "error",
}: ErrorPopupProps) {
  return (
    <Modal
      visible={open}
      onRequestClose={onClose}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{type === "error" ? "Error" : "Success"}</Text>
          <Text style={styles.message}>
            {errorMessage || "Unknown error occurred."}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 17, 17, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.accent,
    padding: 28,
    borderRadius: 0,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.accent,
    fontFamily: colors.pixelFont,
    marginBottom: 16,
    letterSpacing: 2,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: colors.text,
    fontFamily: colors.pixelFont,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignItems: "center",
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: colors.pixelFont,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
