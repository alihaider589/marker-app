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
import { Pin, usePins } from "../../hooks/usePins";

const PIXEL_FONT = colors.pixelFont;

export default function MapScreen() {
  const { signOut } = useAuth();
  const { pins, loading: pinsLoading, error: pinsError, addPin, deletePin, clearError } = usePins();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [savingPin, setSavingPin] = useState(false);

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

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔔 Details modal state changed:', detailsModalVisible);
  }, [detailsModalVisible]);

  // Debug: Log selected pin changes
  useEffect(() => {
    console.log('📍 Selected pin changed:', selectedPin?.id || 'null');
  }, [selectedPin]);

  // Debug: Log pins array changes
  useEffect(() => {
    console.log('📋 Pins loaded:', pins.length, 'pins');
  }, [pins]);

  // Handle pin tap to show details
  const handlePinPress = (pin: Pin) => {
    console.log('🔘 Pin pressed:', pin.id, pin.note); // Debug log
    setSelectedPin(pin);
    setDetailsModalVisible(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    console.log('❌ Closing details modal'); // Debug log
    setDetailsModalVisible(false);
    setSelectedPin(null);
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
    
    console.log('🗺️ Map pressed'); // Debug log
    const { coordinate } = event.nativeEvent;
    setNewPinCoords(coordinate);
    setModalVisible(true);
  };

  // Save new pin with note
  const saveNote = async () => {
    if (!newPinCoords || !noteInput.trim()) return;

    setSavingPin(true);
    try {
      await addPin(newPinCoords.latitude, newPinCoords.longitude, noteInput.trim());
      cancelAddNote();
    } catch (error) {
      console.error('Error saving pin:', error);
      // Error is handled by the usePins hook
    } finally {
      setSavingPin(false);
    }
  };

  // Delete selected pin
  const handleDeletePin = async () => {
    if (!selectedPin?.id) return;

    try {
      await deletePin(selectedPin.id);
      closeDetailsModal();
    } catch (error) {
      console.error('Error deleting pin:', error);
      // Error is handled by the usePins hook
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Emergency reset for debugging
  const emergencyReset = () => {
    console.log('🚨 Emergency reset triggered');
    setModalVisible(false);
    setDetailsModalVisible(false);
    setSelectedPin(null);
    setNewPinCoords(null);
    setNoteInput("");
    setSavingPin(false);
  };

  // Show loading if location or pins are loading
  const isLoading = !location || pinsLoading;

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.subtitle}>
            {!location ? "Loading your location..." : "Loading your pins..."}
          </Text>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
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
          {pins.map((pin, index) => {
            console.log(`🗺️ Rendering pin ${index}:`, pin.id, pin.note.substring(0, 20));
            return (
              <Marker
                key={pin.id || `pin-${index}`}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                title={`Pin ${index + 1}`}
                description={pin.note}
                pinColor="orange"
                onPress={(event) => {
                  console.log('🔘 Marker onPress event triggered for:', pin.id);
                  event.stopPropagation();
                  handlePinPress(pin);
                }}
                onCalloutPress={() => {
                  console.log('💬 Callout pressed for:', pin.id);
                  handlePinPress(pin);
                }}
                onSelect={() => {
                  console.log('✅ Marker selected:', pin.id);
                }}
                onDeselect={() => {
                  console.log('❌ Marker deselected:', pin.id);
                }}
              />
            );
          })}
        </MapView>
      )}

      {/* Header UI */}
      <View style={styles.headerUI}>
        <Text style={styles.title}>Map Screen</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Panel
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>Pins: {pins.length}</Text>
        <Text style={styles.debugText}>
          Details Modal: {detailsModalVisible ? '✅ OPEN' : '❌ CLOSED'}
        </Text>
        <Text style={styles.debugText}>
          Selected Pin: {selectedPin?.id || 'None'}
        </Text>
        {pins.length > 0 && (
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => handlePinPress(pins[0])}
          >
            <Text style={styles.testButtonText}>TEST FIRST PIN</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: colors.error, marginTop: 10 }]} 
          onPress={emergencyReset}
        >
          <Text style={styles.testButtonText}>RESET MODALS</Text>
        </TouchableOpacity>
      </View> */}

      {/* Error display */}
      {pinsError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{pinsError}</Text>
          <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
            <Text style={styles.errorCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

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
              editable={!savingPin}
            />
            <TouchableOpacity 
              style={[styles.saveButton, savingPin && styles.buttonDisabled]} 
              onPress={saveNote}
              disabled={savingPin || !noteInput.trim()}
            >
              <Text style={styles.saveButtonText}>
                {savingPin ? "SAVING..." : "SAVE PIN"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={cancelAddNote}
              disabled={savingPin}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
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
        onShow={() => console.log('📱 Details modal shown')}
        onDismiss={() => console.log('📱 Details modal dismissed')}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => {
            console.log('🔘 Modal overlay pressed');
            closeDetailsModal();
          }}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={(e) => {
              console.log('🔘 Modal container pressed');
              e.stopPropagation();
            }}
          >
            <Text style={styles.modalTitle}>Pin Details</Text>
            {selectedPin ? (
              <View style={styles.pinDetailsContent}>
                <Text style={styles.pinDetailsText}>
                  ID: {selectedPin.id}
                </Text>
                <Text style={styles.pinDetailsText}>
                  Latitude: {selectedPin.latitude.toFixed(6)}
                </Text>
                <Text style={styles.pinDetailsText}>
                  Longitude: {selectedPin.longitude.toFixed(6)}
                </Text>
                <Text style={styles.pinDetailsText}>
                  Note: {selectedPin.note}
                </Text>
                {selectedPin.created_at && (
                  <Text style={styles.pinDetailsText}>
                    Created: {new Date(selectedPin.created_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.pinDetailsText}>No pin data available</Text>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePin}>
              <Text style={styles.deleteButtonText}>DELETE PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeDetailsModal}>
              <Text style={styles.cancelButtonText}>CLOSE</Text>
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
  headerUI: {
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
  buttonDisabled: {
    opacity: 0.7,
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
  errorContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.error,
    padding: 15,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: colors.text,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: colors.background,
    fontSize: 16,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
  },
  errorCloseButton: {
    padding: 5,
  },
  errorCloseText: {
    fontSize: 24,
    color: colors.background,
  },
  debugPanel: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    zIndex: 10,
  },
  debugText: {
    color: colors.background,
    fontSize: 14,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    marginBottom: 5,
  },
  testButton: {
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
    fontSize: 16,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

