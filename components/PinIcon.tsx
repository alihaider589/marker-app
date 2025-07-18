import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { IconLibrary } from '../constants/PinTypes';

interface PinIconProps {
  name: string;
  library: IconLibrary;
  size?: number;
  color?: string;
}

export default function PinIcon({ 
  name, 
  library, 
  size = 24, 
  color = '#000' 
}: PinIconProps) {
  const iconProps = {
    name: name as any,
    size,
    color,
  };

  switch (library) {
    case 'MaterialIcons':
      return <MaterialIcons {...iconProps} />;
    case 'FontAwesome':
      return <FontAwesome {...iconProps} />;
    case 'Ionicons':
      return <Ionicons {...iconProps} />;
    default:
      // Fallback to MaterialIcons with a default pin icon
      return <MaterialIcons name="location-pin" size={size} color={color} />;
  }
} 