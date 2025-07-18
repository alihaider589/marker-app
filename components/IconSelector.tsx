import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../constants/Colors';
import {
    PIN_CATEGORIES,
    PIN_COLORS,
    PIN_ICONS,
    PinCategory,
    PinColor,
    PinIconName,
    getCategoryInfo
} from '../constants/PinTypes';

const PIXEL_FONT = colors.pixelFont;

interface IconSelectorProps {
  selectedIcon: PinIconName;
  selectedColor: PinColor;
  selectedCategory: PinCategory;
  onIconChange: (icon: PinIconName) => void;
  onColorChange: (color: PinColor) => void;
  onCategoryChange: (category: PinCategory) => void;
}

export default function IconSelector({
  selectedIcon,
  selectedColor,
  selectedCategory,
  onIconChange,
  onColorChange,
  onCategoryChange,
}: IconSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'category' | 'icon' | 'color'>('category');

  const handleCategorySelect = (category: PinCategory) => {
    const categoryInfo = getCategoryInfo(category);
    onCategoryChange(category);
    onIconChange(categoryInfo.icon as PinIconName);
    onColorChange(categoryInfo.color as PinColor);
  };

  const renderCategoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Choose Category</Text>
      <View style={styles.categoryGrid}>
        {Object.entries(PIN_CATEGORIES).map(([key, category]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryItem,
              selectedCategory === key && styles.selectedCategoryItem,
            ]}
            onPress={() => handleCategorySelect(key as PinCategory)}
          >
            <View 
              style={[
                styles.categoryIcon, 
                { backgroundColor: category.color }
              ]} 
            />
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderIconTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Choose Icon</Text>
      <View style={styles.iconGrid}>
        {PIN_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon.name}
            style={[
              styles.iconItem,
              selectedIcon === icon.name && styles.selectedIconItem,
            ]}
            onPress={() => onIconChange(icon.name)}
          >
            <View 
              style={[
                styles.iconPreview, 
                { backgroundColor: selectedColor }
              ]} 
            />
            <Text style={styles.iconLabel}>{icon.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderColorTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Choose Color</Text>
      <View style={styles.colorGrid}>
        {PIN_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorItem,
              selectedColor === color && styles.selectedColorItem,
            ]}
            onPress={() => onColorChange(color)}
          >
            <View style={[styles.colorPreview, { backgroundColor: color }]} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={[styles.previewIcon, { backgroundColor: selectedColor }]} />
        <Text style={styles.selectorText}>
          {getCategoryInfo(selectedCategory).label}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Customize Pin</Text>
            
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'category' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('category')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'category' && styles.activeTabText,
                ]}>
                  CATEGORY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'icon' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('icon')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'icon' && styles.activeTabText,
                ]}>
                  ICON
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'color' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('color')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'color' && styles.activeTabText,
                ]}>
                  COLOR
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'category' && renderCategoryTab()}
            {activeTab === 'icon' && renderIconTab()}
            {activeTab === 'color' && renderColorTab()}

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 15,
    borderWidth: 4,
    borderColor: colors.accent,
    borderRadius: 0,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  previewIcon: {
    width: 24,
    height: 24,
    borderRadius: 0,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.text,
  },
  selectorText: {
    color: colors.text,
    fontSize: 18,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    width: '95%',
    maxHeight: '80%',
    borderWidth: 4,
    borderColor: colors.accent,
    borderRadius: 0,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    color: colors.accent,
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: colors.accent,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 4,
    borderBottomColor: colors.accent,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRightWidth: 2,
    borderRightColor: colors.accent,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    fontWeight: '900',
    color: colors.text,
  },
  activeTabText: {
    color: colors.background,
  },
  tabContent: {
    maxHeight: 300,
    padding: 20,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.accent,
    fontFamily: PIXEL_FONT,
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: colors.border,
    borderRadius: 0,
    backgroundColor: colors.background,
  },
  selectedCategoryItem: {
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 0,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.text,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: PIXEL_FONT,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '48%',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: colors.border,
    borderRadius: 0,
    backgroundColor: colors.background,
  },
  selectedIconItem: {
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  iconPreview: {
    width: 32,
    height: 32,
    borderRadius: 0,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.text,
  },
  iconLabel: {
    fontSize: 12,
    fontFamily: PIXEL_FONT,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '23%',
    aspectRatio: 1,
    padding: 8,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: colors.border,
    borderRadius: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorItem: {
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  colorPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: colors.text,
  },
  doneButton: {
    backgroundColor: colors.accent,
    paddingVertical: 15,
    margin: 20,
    borderWidth: 4,
    borderColor: colors.text,
    borderRadius: 0,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
  },
  doneButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: PIXEL_FONT,
    letterSpacing: 2,
  },
}); 