// app/book.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useBible } from '../src/context/contexts';

type TestamentFilter = 'all' | 'ancien' | 'nouveau';

export default function BookScreen() {
  const { colors } = useTheme();
  const { bibleData } = useBible();
  const router = useRouter();
  const [filter, setFilter] = useState<TestamentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const livres = bibleData?.livres || [];

  // Filtrer les livres par testament
  const livresFiltresParTestament = livres.filter((l: any) => {
    if (filter === 'all') return true;
    return l.testament === filter;
  });

  // Filtrer par recherche
  const livresFiltres = livresFiltresParTestament.filter((l: any) => {
    if (!searchQuery.trim()) return true;
    return l.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (l.abrev && l.abrev.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Regrouper les livres par catégorie
  const livresParCategorie: Record<string, any[]> = {};
  livresFiltres.forEach((livre: any, index: number) => {
    const originalIndex = livres.findIndex((l: any) => l.nom === livre.nom);
    const categorie = livre.categorie || (livre.testament === 'ancien' ? 'Ancien Testament' : 'Nouveau Testament');
    if (!livresParCategorie[categorie]) livresParCategorie[categorie] = [];
    livresParCategorie[categorie].push({ ...livre, originalIndex });
  });

  const styles = makeStyles(colors);

  const handleSelectBook = (bookIndex: number) => {
    router.push({
      pathname: '/read',
      params: { bookIndex, viewMode: 'chapitres' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Livres de la Bible</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher un livre..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres testament */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: '📖 Tous' },
          { key: 'ancien', label: '📜 Ancien Testament' },
          { key: 'nouveau', label: '✝️ Nouveau Testament' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key as TestamentFilter)}
          >
            <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des livres par catégorie */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {Object.keys(livresParCategorie).length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Aucun livre trouvé
            </Text>
          </View>
        ) : (
          Object.entries(livresParCategorie).map(([categorie, livresCat]) => (
            <View key={categorie} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categorie.toUpperCase()}</Text>
              {livresCat.map((livre: any) => (
                <TouchableOpacity
                  key={livre.originalIndex}
                  style={styles.bookItem}
                  onPress={() => handleSelectBook(livre.originalIndex)}
                  activeOpacity={0.7}
                >
                  <View style={styles.bookAvatar}>
                    <Text style={styles.bookAvatarText}>
                      {livre.abrev?.substring(0, 2) || livre.nom.substring(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookName}>{livre.nom}</Text>
                    <Text style={styles.bookSub}>
                      {livre.chapitres?.length || 0} chapitres
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.headerText,
    fontSize: 18,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  bookAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bookAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bookSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});