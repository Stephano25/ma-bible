// src/components/VersetCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface VersetCardProps {
  reference: string;
  text: string;
  isBookmarked?: boolean;
  onPress?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export function VersetCard({ 
  reference, 
  text, 
  isBookmarked = false, 
  onPress, 
  onBookmark, 
  onShare 
}: VersetCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.reference}>{reference}</Text>
        <View style={styles.actions}>
          {onBookmark && (
            <TouchableOpacity onPress={onBookmark} style={styles.actionBtn}>
              <Ionicons 
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                size={18} 
                color={isBookmarked ? colors.accent : colors.textMuted} 
              />
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
              <Ionicons name="share-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={4}>
        "{text}"
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reference: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  text: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
});