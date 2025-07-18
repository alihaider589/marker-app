// Pin category definitions
export const PIN_CATEGORIES = {
  general: { label: 'General', icon: 'location-pin', color: '#FF6B6B', library: 'MaterialIcons' },
  restaurant: { label: 'Food & Drink', icon: 'restaurant', color: '#4ECDC4', library: 'MaterialIcons' },
  travel: { label: 'Travel', icon: 'airplane', color: '#45B7D1', library: 'MaterialIcons' },
  work: { label: 'Work', icon: 'work', color: '#96CEB4', library: 'MaterialIcons' },
  home: { label: 'Home', icon: 'home', color: '#FECA57', library: 'MaterialIcons' },
  favorite: { label: 'Favorite', icon: 'favorite', color: '#FF9FF3', library: 'MaterialIcons' },
  event: { label: 'Event', icon: 'event', color: '#54A0FF', library: 'MaterialIcons' },
  shopping: { label: 'Shopping', icon: 'shopping-cart', color: '#5F27CD', library: 'MaterialIcons' },
  nature: { label: 'Nature', icon: 'park', color: '#00D2D3', library: 'MaterialIcons' },
  health: { label: 'Health', icon: 'local-hospital', color: '#FF6B6B', library: 'MaterialIcons' },
} as const;

// Available icon options
export const PIN_ICONS = [
  { name: 'location-pin', label: 'Default Pin', library: 'MaterialIcons' },
  { name: 'restaurant', label: 'Restaurant', library: 'MaterialIcons' },
  { name: 'airplane', label: 'Travel', library: 'MaterialIcons' },
  { name: 'work', label: 'Work', library: 'MaterialIcons' },
  { name: 'home', label: 'Home', library: 'MaterialIcons' },
  { name: 'favorite', label: 'Favorite', library: 'MaterialIcons' },
  { name: 'event', label: 'Event', library: 'MaterialIcons' },
  { name: 'shopping-cart', label: 'Shopping', library: 'MaterialIcons' },
  { name: 'park', label: 'Nature', library: 'MaterialIcons' },
  { name: 'local-hospital', label: 'Health', library: 'MaterialIcons' },
  { name: 'camera', label: 'Photo Spot', library: 'MaterialIcons' },
  { name: 'local-cafe', label: 'Coffee', library: 'MaterialIcons' },
  { name: 'local-gas-station', label: 'Gas Station', library: 'MaterialIcons' },
  { name: 'school', label: 'School', library: 'MaterialIcons' },
  { name: 'account-balance', label: 'Bank', library: 'MaterialIcons' },
  { name: 'local-parking', label: 'Parking', library: 'MaterialIcons' },
  { name: 'wifi', label: 'WiFi Spot', library: 'MaterialIcons' },
  { name: 'fitness-center', label: 'Gym', library: 'MaterialIcons' },
  { name: 'local-pharmacy', label: 'Pharmacy', library: 'MaterialIcons' },
  { name: 'pets', label: 'Pet Friendly', library: 'MaterialIcons' },
] as const;

// Predefined color palette
export const PIN_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FECA57', // Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Light Blue
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9F43', // Orange
  '#10AC84', // Dark Green
  '#EE5A24', // Dark Orange
  '#0984e3', // Dark Blue
  '#6c5ce7', // Light Purple
  '#a29bfe', // Lavender
  '#fd79a8', // Rose
] as const;

export type PinCategory = keyof typeof PIN_CATEGORIES;
export type PinIconName = typeof PIN_ICONS[number]['name'];
export type PinColor = typeof PIN_COLORS[number];
export type IconLibrary = 'MaterialIcons' | 'FontAwesome' | 'Ionicons';

// Helper function to get category info
export const getCategoryInfo = (category: PinCategory) => {
  return PIN_CATEGORIES[category] || PIN_CATEGORIES.general;
};

// Helper function to get icon info
export const getIconInfo = (iconName: PinIconName) => {
  return PIN_ICONS.find(icon => icon.name === iconName) || PIN_ICONS[0];
};

// Helper function to get icon label
export const getIconLabel = (iconName: PinIconName) => {
  return PIN_ICONS.find(icon => icon.name === iconName)?.label || 'Unknown';
}; 