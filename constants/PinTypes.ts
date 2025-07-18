// Pin category definitions
export const PIN_CATEGORIES = {
  general: { label: 'General', icon: 'map-pin', color: '#FF6B6B' },
  restaurant: { label: 'Food & Drink', icon: 'restaurant', color: '#4ECDC4' },
  travel: { label: 'Travel', icon: 'airplane', color: '#45B7D1' },
  work: { label: 'Work', icon: 'briefcase', color: '#96CEB4' },
  home: { label: 'Home', icon: 'home', color: '#FECA57' },
  favorite: { label: 'Favorite', icon: 'heart', color: '#FF9FF3' },
  event: { label: 'Event', icon: 'calendar', color: '#54A0FF' },
  shopping: { label: 'Shopping', icon: 'shopping-bag', color: '#5F27CD' },
  nature: { label: 'Nature', icon: 'tree', color: '#00D2D3' },
  health: { label: 'Health', icon: 'plus-circle', color: '#FF6B6B' },
} as const;

// Available icon options
export const PIN_ICONS = [
  { name: 'map-pin', label: 'Default Pin' },
  { name: 'restaurant', label: 'Restaurant' },
  { name: 'airplane', label: 'Travel' },
  { name: 'briefcase', label: 'Work' },
  { name: 'home', label: 'Home' },
  { name: 'heart', label: 'Favorite' },
  { name: 'calendar', label: 'Event' },
  { name: 'shopping-bag', label: 'Shopping' },
  { name: 'tree', label: 'Nature' },
  { name: 'plus-circle', label: 'Health' },
  { name: 'camera', label: 'Photo Spot' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'gas-station', label: 'Gas Station' },
  { name: 'hospital', label: 'Hospital' },
  { name: 'school', label: 'School' },
  { name: 'bank', label: 'Bank' },
  { name: 'parking', label: 'Parking' },
  { name: 'wifi', label: 'WiFi Spot' },
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

// Helper function to get category info
export const getCategoryInfo = (category: PinCategory) => {
  return PIN_CATEGORIES[category] || PIN_CATEGORIES.general;
};

// Helper function to get icon label
export const getIconLabel = (iconName: PinIconName) => {
  return PIN_ICONS.find(icon => icon.name === iconName)?.label || 'Unknown';
}; 