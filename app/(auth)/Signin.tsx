// import ParallaxScrollView from "@/components/ParallaxScrollView";
import React, { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ErrorPopup from "../../components/errorPopup";
import { colors } from "../../constants/Colors";
import useAuth from "../../hooks/useAuth";

const PIXEL_FONT = colors.pixelFont;

export default function Signin() {
  const [credentails, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail } = useAuth();

  const handleSignIn = async () => {
    if (!credentails.email || !credentails.password) {
      setErrorMessage("Please fill in all fields");
      setShowErrorPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(credentails.email, credentails.password);
      console.log("Sign-in successful");
      // Navigation will be handled automatically by the root layout
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setShowErrorPopup(true);
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred during sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorPopup
        errorMessage={errorMessage}
        onClose={() => setShowErrorPopup(false)}
        open={showErrorPopup}
      />
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.accent}
          value={credentails.email}
          onChangeText={(e: string) =>
            setCredentials({ ...credentails, email: e })
          }
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.accent}
          value={credentails.password}
          onChangeText={(e: string) =>
            setCredentials({ ...credentails, password: e })
          }
          secureTextEntry
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    width: "90%",
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: colors.accent,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 36,
    textAlign: "center",
    color: colors.accent,
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textShadowColor: colors.background,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  input: {
    width: "100%",
    height: 56,
    borderColor: colors.accent,
    borderWidth: 4,
    borderRadius: 0,
    paddingHorizontal: 18,
    marginBottom: 22,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    fontSize: 20,
    letterSpacing: 1,
  },
  button: {
    width: "100%",
    backgroundColor: colors.accent,
    paddingVertical: 20,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text,
    marginTop: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
