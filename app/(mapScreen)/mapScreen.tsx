import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import IconSelector from "../../components/IconSelector";
import PinIcon from "../../components/PinIcon";
import { colors } from "../../constants/Colors";
import { PinCategory, PinColor, PinIconName, getCategoryInfo } from "../../constants/PinTypes";
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

  // Icon selector state
  const [selectedIcon, setSelectedIcon] = useState<PinIconName>('location-pin');
  const [selectedColor, setSelectedColor] = useState<PinColor>('#FF6B6B');
  const [selectedCategory, setSelectedCategory] = useState<PinCategory>('general');

  // Reset to default icon settings
  const resetIconSettings = () => {
    const defaultCategory = getCategoryInfo('general');
    setSelectedCategory('general');
    setSelectedIcon(defaultCategory.icon as PinIconName);
    setSelectedColor(defaultCategory.color as PinColor);
  };

  // Cancel add note modal
  const cancelAddNote = () => {
    setModalVisible(false);
    setNoteInput("");
    setNewPinCoords(null);
    resetIconSettings();
  };

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

  // Handle pin tap to show details
  const handlePinPress = (pin: Pin) => {
    setSelectedPin(pin);
    setDetailsModalVisible(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedPin(null);
  };

  // Handle map tap (only for empty areas)
  const handleMapPress = (event: MapPressEvent) => {
    // Don't handle if any modal is open
    if (modalVisible || detailsModalVisible) return;
    
    const { coordinate } = event.nativeEvent;
    setNewPinCoords(coordinate);
    setModalVisible(true);
  };

  // Save new pin with note and custom icon
  const saveNote = async () => {
    if (!newPinCoords || !noteInput.trim()) return;

    setSavingPin(true);
    try {
      await addPin(
        newPinCoords.latitude, 
        newPinCoords.longitude, 
        noteInput.trim(),
        selectedIcon,
        selectedColor,
        selectedCategory
      );
      cancelAddNote();
    } catch (error) {
      console.error('Error saving pin:', error);
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

  // Show loading if location or pins are loading
  const isLoading = !location || pinsLoading;

  // Helper function to handle pins with missing icon data (backward compatibility)
  const getPinIconData = (pin: Pin) => {
    // If pin has icon data, use it
    if (pin.icon_name && pin.icon_color && pin.category) {
      return {
        iconName: pin.icon_name,
        iconColor: pin.icon_color,
        category: pin.category,
      };
    }
    
    // Fallback for old pins without icon data
    const defaultCategory = getCategoryInfo('general');
    return {
      iconName: defaultCategory.icon as PinIconName,
      iconColor: defaultCategory.color as PinColor,
      category: 'general' as PinCategory,
    };
  };



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
            pinColor="blue"
          />

          {/* Render saved pins */}
          {pins.map((pin, index) => {
            const pinData = getPinIconData(pin);
            const categoryInfo = getCategoryInfo(pinData.category);
            return (
              <Marker
                key={pin.id || `pin-${index}`}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                title={categoryInfo.label}
                description={pin.note}
                onPress={(event) => {
                  event.stopPropagation();
                  handlePinPress(pin);
                }}
                onCalloutPress={() => {
                  handlePinPress(pin);
                }}
                tracksViewChanges={false}
                stopPropagation={true}
              >
                <View style={styles.customMarker}>
                  <PinIcon 
                    name={pinData.iconName} 
                    library={categoryInfo.library || "MaterialIcons"}
                    color={pinData.iconColor} 
                    size={32} 
                  />
                </View>
              </Marker>
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
          <KeyboardAvoidingView 
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 30}
            enabled={true}
          >
            <TouchableOpacity 
              style={styles.modalContainer} 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalContentWrapper}>
                  <Text style={styles.modalTitle}>Add a Pin</Text>
                  
                  {/* Icon Selector */}
                  <IconSelector
                    selectedIcon={selectedIcon}
                    selectedColor={selectedColor}
                    selectedCategory={selectedCategory}
                    onIconChange={setSelectedIcon}
                    onColorChange={setSelectedColor}
                    onCategoryChange={setSelectedCategory}
                  />
                  
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
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
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
          <KeyboardAvoidingView 
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
          >
            <TouchableOpacity 
              style={styles.modalContainer} 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalContentWrapper}>
                  <Text style={styles.modalTitle}>Pin Details</Text>
                  {selectedPin ? (
                    <View style={styles.pinDetailsContent}>
                      <View style={styles.pinHeader}>
                        <View 
                          style={[
                            styles.pinColorIndicator, 
                            { backgroundColor: selectedPin.icon_color || '#FF6B6B' }
                          ]} 
                        />
                        <Text style={styles.pinCategoryText}>
                          {getCategoryInfo(selectedPin.category || 'general').label}
                        </Text>
                      </View>
                      <View style={styles.pinIconContainer}>
                        <PinIcon 
                          name={selectedPin.icon_name || 'location-pin'} 
                          library="MaterialIcons"
                          color={selectedPin.icon_color || '#FF6B6B'} 
                          size={40} 
                        />
                      </View>
                      <Text style={styles.pinDetailsText}>
                        Note: {selectedPin.note}
                      </Text>
                      <Text style={styles.pinDetailsText}>
                        Latitude: {selectedPin.latitude.toFixed(6)}
                      </Text>
                      <Text style={styles.pinDetailsText}>
                        Longitude: {selectedPin.longitude.toFixed(6)}
                      </Text>
                      {selectedPin.created_at && (
                        <Text style={styles.pinDetailsText}>
                          Created: {new Date(selectedPin.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.pinDetailsContent}>
                      <Text style={styles.pinDetailsText}>No pin data available</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePin}>
                    <Text style={styles.deleteButtonText}>DELETE PIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeDetailsModal}>
                    <Text style={styles.cancelButtonText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
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
    alignSelf: "stretch",
  },
  pinDetailsText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    marginBottom: 8,
  },
  deleteButton: {
    width: "100%",
    minWidth: "100%",
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
    alignSelf: "stretch",
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
    minWidth: "100%",
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
    alignSelf: "stretch",
  },
  cancelButtonText: {
    color: colors.accent,
    fontSize: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContainer: {
    backgroundColor: colors.card,
    width: "90%",
    maxWidth: 400,
    maxHeight: "90%",
    padding: 32,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    alignSelf: "center",
  },
  modalScrollContent: {
    width: "100%",
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalContentWrapper: {
    width: "100%",
    alignItems: 'center',
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
    width: "100%",
  },
  input: {
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
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
    alignSelf: "stretch",
  },
  saveButton: {
    width: "100%",
    minWidth: "100%",
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
    alignSelf: "stretch",
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: "900",
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  pinCategoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
  },
  pinIconContainer: {
    marginBottom: 15,
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
  keyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  customMarker: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

