import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { colors } from "../../constants/Colors";
import useAuth from "../../hooks/useAuth";

const PIXEL_FONT = colors.pixelFont;
const PINS_STORAGE_KEY = 'user_pins';

interface Pin {
  latitude: number;
  longitude: number;
  note: string;
}

export default function MapScreen() {
  const { signOut } = useAuth();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [noteInput, setNoteInput] = useState("");

  // Load current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // Load saved pins from storage
  useEffect(() => {
    const loadPins = async () => {
      try {
        const savedPins = await AsyncStorage.getItem(PINS_STORAGE_KEY);
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }
      } catch (error) {
        console.error('Error loading pins:', error);
      }
    };

    loadPins();
  }, []);

  // Save pins to storage whenever pins array changes
  useEffect(() => {
    const savePins = async () => {
      try {
        await AsyncStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
      } catch (error) {
        console.error('Error saving pins:', error);
      }
    };

    savePins();
  }, [pins]);

  // Handle pin tap to show details
  const handlePinPress = (pin: Pin, index: number) => {
    console.log('Pin pressed:', pin, index); // Debug log
    setSelectedPin(pin);
    setSelectedPinIndex(index);
    setDetailsModalVisible(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedPin(null);
    setSelectedPinIndex(null);
  };

  // Cancel add note modal
  const cancelAddNote = () => {
    setModalVisible(false);
    setNoteInput("");
    setNewPinCoords(null);
  };

  // Handle map tap (only for empty areas)
  const handleMapPress = (event: MapPressEvent) => {
    // Don't handle if any modal is open
    if (modalVisible || detailsModalVisible) return;

    console.log('Map pressed'); // Debug log
    const { coordinate } = event.nativeEvent;
    setNewPinCoords(coordinate);
    setModalVisible(true);
  };

  // Save new pin with note
  const saveNote = () => {
    if (newPinCoords && noteInput.trim()) {
      const newPin: Pin = {
        latitude: newPinCoords.latitude,
        longitude: newPinCoords.longitude,
        note: noteInput.trim(),
      };
      setPins(prevPins => [...prevPins, newPin]);
    }

    // Always reset modal regardless of whether pin was saved
    cancelAddNote();
  };

  // Delete selected pin
  const deletePin = async () => {
    if (selectedPinIndex !== null) {
      const updatedPins = pins.filter((_, index) => index !== selectedPinIndex);
      setPins(updatedPins);

      // Explicitly save the updated pins array (including empty array)
      try {
        await AsyncStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(updatedPins));
      } catch (error) {
        console.error('Error saving pins after deletion:', error);
      }
    }

    // Close modal immediately
    setDetailsModalVisible(false);
    setSelectedPin(null);
    setSelectedPinIndex(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {/* Render user location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />

          {/* Render saved pins */}
          {pins.map((pin, index) => (
            <Marker
              key={`pin-${index}-${pin.latitude}-${pin.longitude}`}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              title={`Pin ${index + 1}`}
              description={pin.note}
              pinColor="orange"
              onPress={(event) => {
                event.stopPropagation();
                console.log('Marker onPress triggered for pin:', index);
                handlePinPress(pin, index);
              }}
              onCalloutPress={() => {
                console.log('Callout pressed for pin:', index);
                handlePinPress(pin, index);
              }}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.subtitle}>Loading your location...</Text>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      {/* Sign out button */}
      <View style={styles.floatingUI}>
        <Text style={styles.title}>Map Screen</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>SIGN OUT</Text>
        </TouchableOpacity>

        {/* Debug info
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Pins: {pins.length}</Text>
          <Text style={styles.debugText}>Details Modal: {detailsModalVisible ? 'OPEN' : 'CLOSED'}</Text>
          <Text style={styles.debugText}>Add Modal: {modalVisible ? 'OPEN' : 'CLOSED'}</Text>
          
          {pins.length > 0 && (
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={() => handlePinPress(pins[0], 0)}
            >
              <Text style={styles.testButtonText}>Test First Pin</Text>
            </TouchableOpacity>
          )}
        </View> */}
      </View>

      {/* Modal for note input */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelAddNote}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={cancelAddNote}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Add a Note</Text>
            <TextInput
              placeholder="Type your note here..."
              placeholderTextColor={colors.accent}
              style={styles.input}
              value={noteInput}
              onChangeText={setNoteInput}
              multiline
              autoFocus={true}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={styles.saveButtonText}>Save Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelAddNote}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal for pin details */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailsModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDetailsModal}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Pin Details</Text>
            {selectedPin ? (
              <View style={styles.pinDetailsContent}>
                <Text style={styles.pinDetailsText}>Latitude: {selectedPin.latitude.toFixed(6)}</Text>
                <Text style={styles.pinDetailsText}>Longitude: {selectedPin.longitude.toFixed(6)}</Text>
                <Text style={styles.pinDetailsText}>Note: {selectedPin.note}</Text>
              </View>
            ) : (
              <Text style={styles.pinDetailsText}>No pin selected</Text>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={deletePin}>
              <Text style={styles.deleteButtonText}>Delete Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeDetailsModal}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  floatingUI: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: colors.accent,
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textShadowColor: colors.background,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 4,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  signOutButton: {
    marginTop: 15,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  signOutButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    width: "90%",
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 24,
    fontFamily: PIXEL_FONT,
    textAlign: "center",
    color: colors.accent,
    letterSpacing: 2,
    textShadowColor: colors.background,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  input: {
    width: "100%",
    height: 100,
    borderColor: colors.accent,
    borderWidth: 4,
    borderRadius: 0,
    paddingHorizontal: 18,
    paddingVertical: 15,
    marginBottom: 22,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    letterSpacing: 1,
    textAlignVertical: "top",
  },
  saveButton: {
    width: "100%",
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    marginBottom: 15,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pinDetailsContent: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 4,
    borderColor: colors.accent,
    borderRadius: 0,
    backgroundColor: colors.background,
    width: "100%",
  },
  pinDetailsText: {
    fontSize: 18,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    marginBottom: 10,
  },
  deleteButton: {
    width: "100%",
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    marginBottom: 15,
  },
  deleteButtonText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cancelButton: {
    width: "100%",
    backgroundColor: colors.text,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.accent,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  cancelButtonText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  debugContainer: {
    marginTop: 10,
    backgroundColor: colors.card,
    padding: 10,
    borderWidth: 4,
    borderColor: colors.accent,
    borderRadius: 0,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  debugText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    marginBottom: 5,
  },
  testButton: {
    marginTop: 10,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  testButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

