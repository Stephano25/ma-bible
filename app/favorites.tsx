// app/favorites.tsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useBible } from '../src/context/BibleContext';
import { Bookmark } from '../src/types';

type FilterTab = 'tous' | 'recents' | 'fr' | 'en' | 'mg';

export default function FavorisScreen() {
  const { colors } = useTheme();
  const { bookmarks, removeBookmark, fontSize, lang } = useBible();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('tous');

  const filteredBookmarks = (): Bookmark[] => {
    switch (activeTab) {
      case 'recents':
        return [...bookmarks].slice(0, 20);
      case 'fr':
        return bookmarks.filter((b: Bookmark) => b.lang === 'fr');
      case 'en':
        return bookmarks.filter((b: Bookmark) => b.lang === 'en');
      case 'mg':
        return bookmarks.filter((b: Bookmark) => b.lang === 'mg');
      default:
        return bookmarks;
    }
  };

  const formatDate = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Retirer ce verset des favoris ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeBookmark(id) },
    ]);
  };

  const handleShare = async (bm: Bookmark) => {
    await Share.share({
      message: `📖 ${bm.book} ${bm.chapter}:${bm.verse}\n\n"${bm.text}"\n\n— Ma Bible App`,
    });
  };

  const handleOpen = (bm: Bookmark) => {
    const parts = bm.id.split('-');
    router.push({
      pathname: '/read',
      params: { 
        bookIndex: parts[0], 
        chapterIndex: parts[1],
        highlightVerse: parts[2],
        source: 'favorites'
      },
    });
  };

  const styles = makeStyles(colors);
  const displayed = filteredBookmarks();

  const getLangLabel = () => {
    switch(activeTab) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'mg': return 'Malagasy';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {lang === 'fr' ? 'Mes Favoris' : lang === 'en' ? 'My Favorites' : 'Tiako'}
        </Text>
        <Text style={styles.headerSub}>
          {bookmarks.length} {lang === 'fr' ? 'verset(s)' : lang === 'en' ? 'verse(s)' : 'andinin-teny'} sauvegardé(s)
        </Text>
      </View>

      <View style={styles.tabs}>
        {([
          { key: 'tous', label: lang === 'fr' ? 'Tous' : lang === 'en' ? 'All' : 'Rehetra' },
          { key: 'recents', label: lang === 'fr' ? 'Récents' : lang === 'en' ? 'Recent' : 'Vaovao' },
          { key: 'fr', label: '🇫🇷 FR' },
          { key: 'en', label: '🇬🇧 EN' },
          { key: 'mg', label: '🇲🇬 MG' },
        ] as { key: FilterTab; label: string }[]).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab !== 'tous' && activeTab !== 'recents' && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            {displayed.length} {lang === 'fr' ? 'verset(s) en' : lang === 'en' ? 'verse(s) in' : 'andinin-teny amin\'ny'} {getLangLabel()}
          </Text>
        </View>
      )}

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {lang === 'fr' ? 'Aucun favori' : lang === 'en' ? 'No favorites' : 'Tsy misy tiako'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {lang === 'fr' 
              ? 'Appuyez sur un verset dans l\'écran de lecture pour l\'ajouter ici.' 
              : lang === 'en' 
                ? 'Tap on a verse in the reading screen to add it here.' 
                : 'Tsindrio ny andinin-teny ao amin\'ny efijery famakiana raha te hampiditra azy eto.'}
          </Text>
        </View>
      ) : displayed.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="filter-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {lang === 'fr' ? 'Aucun résultat pour ce filtre' : lang === 'en' ? 'No results for this filter' : 'Tsy misy valiny ho an\'io sivana io'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleOpen(item)} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardRef}>
                  {item.book} {item.chapter}:{item.verse}
                </Text>
                <View style={styles.cardActions}>
                  <View style={[styles.langBadge, { backgroundColor: item.lang === 'fr' ? colors.primary + '20' : item.lang === 'en' ? colors.accent + '20' : '#4CAF5020' }]}>
                    <Text style={[styles.langBadgeText, { color: item.lang === 'fr' ? colors.primary : item.lang === 'en' ? colors.accent : '#4CAF50' }]}>
                      {item.lang === 'fr' ? 'FR' : item.lang === 'en' ? 'EN' : 'MG'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleShare(item)} style={styles.iconBtn}>
                    <Ionicons name="share-outline" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.cardText, { fontSize: fontSize - 2 }]} numberOfLines={4}>
                "{item.text}"
              </Text>

              <Text style={styles.cardDate}>
                {lang === 'fr' ? 'Ajouté le' : lang === 'en' ? 'Added on' : 'Nampiana tamin\'ny'} {formatDate(item.addedAt)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: colors.headerText, fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  filterInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterInfoText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { textAlign: 'center', lineHeight: 22 },
  list: { padding: 12, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardRef: { fontSize: 14, fontWeight: '800', color: colors.primary },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  langBadgeText: { fontSize: 11, fontWeight: '800' },
  iconBtn: { padding: 4 },
  cardText: { color: colors.text, fontStyle: 'italic', lineHeight: 24, marginBottom: 8 },
  cardDate: { fontSize: 11, color: colors.textMuted },
});