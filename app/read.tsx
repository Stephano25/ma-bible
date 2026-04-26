// app/lecture.tsx
// ============================================================
//  ÉCRAN LECTURE — Navigation Livre → Chapitre → Versets
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Modal, Share, Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useBible } from '../src/context/BibleContext';
import { Bookmark } from '../src/types';

type ViewMode = 'livres' | 'chapitres' | 'versets';

export default function LectureScreen() {
  const { colors } = useTheme();
  const { bibleData, lang, fontSize, setFontSize, lastPosition, saveLastPosition, addBookmark, removeBookmark, isBookmarked } = useBible();
  const params = useLocalSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('livres');
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [filterTestament, setFilterTestament] = useState<'all' | 'ancien' | 'nouveau'>('all');
  const scrollRef = useRef<ScrollView>(null);

  const livres = bibleData?.livres || [];

  useEffect(() => {
    if (params.bookIndex !== undefined) {
      setSelectedBookIndex(Number(params.bookIndex));
      setSelectedChapterIndex(Number(params.chapterIndex || 0));
      setViewMode('versets');
    }
    if (params.testament) {
      setFilterTestament(params.testament as any);
    }
  }, []);

  // Regrouper livres par catégorie
  const livresFiltres = livres.filter((l: any) => {
    if (filterTestament === 'all') return true;
    return l.testament === filterTestament;
  });

  const livresParCategorie: Record<string, any[]> = {};
  livresFiltres.forEach((livre: any) => {
    const cat = livre.categorie || (livre.testament === 'ancien' ? 'Ancien Testament' : 'Nouveau Testament');
    if (!livresParCategorie[cat]) livresParCategorie[cat] = [];
    livresParCategorie[cat].push({ ...livre, originalIndex: livres.indexOf(livre) });
  });

  const currentBook = livres[selectedBookIndex];
  const currentChapter = currentBook?.chapitres?.[selectedChapterIndex];

  const goBack = () => {
    if (viewMode === 'versets') setViewMode('chapitres');
    else if (viewMode === 'chapitres') setViewMode('livres');
  };

  const selectBook = (bookOriginalIndex: number) => {
    setSelectedBookIndex(bookOriginalIndex);
    setSelectedChapterIndex(0);
    setViewMode('chapitres');
  };

  const selectChapter = (chapterIndex: number) => {
    setSelectedChapterIndex(chapterIndex);
    setViewMode('versets');
    const book = livres[selectedBookIndex];
    saveLastPosition({
      bookIndex: selectedBookIndex,
      chapterIndex,
      bookName: book?.nom || '',
      chapterNum: chapterIndex + 1,
    });
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const toggleBookmark = (versetNum: number, texte: string) => {
    const id = `${selectedBookIndex}-${selectedChapterIndex}-${versetNum}-${lang}`;
    if (isBookmarked(id)) {
      removeBookmark(id);
    } else {
      const bm: Bookmark = {
        id,
        book: currentBook?.nom || '',
        bookAbrev: currentBook?.abrev || '',
        chapter: selectedChapterIndex + 1,
        verse: versetNum,
        text: texte,
        addedAt: new Date().toISOString(),
        category: 'general',
        lang,
      };
      addBookmark(bm);
    }
  };

  const partagerVerset = async (versetNum: number, texte: string) => {
    await Share.share({
      message: `📖 ${currentBook?.nom} ${selectedChapterIndex + 1}:${versetNum}\n\n"${texte}"\n\n— Ma Bible App`,
    });
  };

  const styles = makeStyles(colors);

  // ── VUE LISTE DES LIVRES ──────────────────────────────────
  if (viewMode === 'livres') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Livres de la Bible</Text>
          {/* Filtre testament */}
          <View style={styles.filterRow}>
            {(['all', 'ancien', 'nouveau'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filterTestament === f && styles.filterBtnActive]}
                onPress={() => setFilterTestament(f)}
              >
                <Text style={[styles.filterBtnText, filterTestament === f && styles.filterBtnTextActive]}>
                  {f === 'all' ? 'Tous' : f === 'ancien' ? 'A.T.' : 'N.T.'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(livresParCategorie).map(([categorie, livresCat]) => (
            <View key={categorie}>
              <Text style={styles.categorieTitle}>{categorie.toUpperCase()}</Text>
              {livresCat.map((livre: any) => (
                <TouchableOpacity
                  key={livre.originalIndex}
                  style={styles.livreItem}
                  onPress={() => selectBook(livre.originalIndex)}
                >
                  <View style={styles.livreAvatar}>
                    <Text style={styles.livreAvatarText}>{livre.abrev?.substring(0, 2)}</Text>
                  </View>
                  <View style={styles.livreInfo}>
                    <Text style={styles.livreName}>{livre.nom}</Text>
                    <Text style={styles.livreSub}>{livre.chapitres?.length || 0} chapitres</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── VUE LISTE DES CHAPITRES ───────────────────────────────
  if (viewMode === 'chapitres') {
    const chapitres = currentBook?.chapitres || [];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentBook?.nom}</Text>
          <View style={{ width: 30 }} />
        </View>
        <FlatList
          data={chapitres}
          keyExtractor={(_, i) => String(i)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.chapterCell,
                lastPosition?.bookIndex === selectedBookIndex && lastPosition?.chapterIndex === index
                  && styles.chapterCellActive,
              ]}
              onPress={() => selectChapter(index)}
            >
              <Text style={[
                styles.chapterCellText,
                lastPosition?.bookIndex === selectedBookIndex && lastPosition?.chapterIndex === index
                  && styles.chapterCellTextActive,
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ── VUE VERSETS ───────────────────────────────────────────
  const versets = currentChapter?.versets || [];
  const totalChapters = currentBook?.chapitres?.length || 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header lecture */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentBook?.nom} {selectedChapterIndex + 1}</Text>
          <Text style={styles.headerSub}>Ch. {selectedChapterIndex + 1} / {totalChapters}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.backBtn}>
          <Ionicons name="text" size={20} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Navigation chapitre */}
      <View style={styles.chapterNav}>
        <TouchableOpacity
          disabled={selectedChapterIndex === 0}
          onPress={() => selectChapter(selectedChapterIndex - 1)}
          style={[styles.navBtn, selectedChapterIndex === 0 && styles.navBtnDisabled]}
        >
          <Ionicons name="chevron-back" size={16} color={selectedChapterIndex === 0 ? colors.textMuted : colors.primary} />
          <Text style={[styles.navBtnText, selectedChapterIndex === 0 && { color: colors.textMuted }]}>
            Ch. {selectedChapterIndex}
          </Text>
        </TouchableOpacity>
        <Text style={styles.chapterNavTitle}>Chapitre {selectedChapterIndex + 1} / {totalChapters}</Text>
        <TouchableOpacity
          disabled={selectedChapterIndex >= totalChapters - 1}
          onPress={() => selectChapter(selectedChapterIndex + 1)}
          style={[styles.navBtn, selectedChapterIndex >= totalChapters - 1 && styles.navBtnDisabled]}
        >
          <Text style={[styles.navBtnText, selectedChapterIndex >= totalChapters - 1 && { color: colors.textMuted }]}>
            Ch. {selectedChapterIndex + 2}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={selectedChapterIndex >= totalChapters - 1 ? colors.textMuted : colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.versetsContent}>
        {versets.map((v: any) => {
          const id = `${selectedBookIndex}-${selectedChapterIndex}-${v.numero}-${lang}`;
          const bookmarked = isBookmarked(id);
          return (
            <TouchableOpacity
              key={v.numero}
              style={[styles.verset, bookmarked && styles.versetBookmarked]}
              onLongPress={() => partagerVerset(v.numero, v.texte)}
              onPress={() => toggleBookmark(v.numero, v.texte)}
            >
              <Text style={styles.versetNum}>{v.numero}</Text>
              <Text style={[styles.versetText, { fontSize }]}>{v.texte}</Text>
              {bookmarked && (
                <Ionicons name="bookmark" size={16} color={colors.accent} style={styles.versetIcon} />
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal réglages typographie */}
      <Modal visible={showSettings} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSettings(false)}>
          <View style={[styles.settingsPanel, { backgroundColor: colors.surface }]}>
            <Text style={[styles.settingsTitle, { color: colors.text }]}>Taille du texte</Text>
            <View style={styles.fontSizeRow}>
              {[14, 16, 18, 20, 22, 24].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.fontSizeBtn, { backgroundColor: fontSize === s ? colors.primary : colors.surfaceAlt }]}
                  onPress={() => setFontSize(s)}
                >
                  <Text style={[styles.fontSizeBtnText, { color: fontSize === s ? '#fff' : colors.text }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.settingsHint, { color: colors.textMuted }]}>
              Appuyez sur un verset pour l'ajouter aux favoris.{'\n'}
              Maintenez pour partager.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: colors.headerText, fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center' },
  headerCenter: { alignItems: 'center' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBtnActive: { backgroundColor: '#fff' },
  filterBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  filterBtnTextActive: { color: colors.primary },
  categorieTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  livreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 10,
  },
  livreAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  livreAvatarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  livreInfo: { flex: 1 },
  livreName: { fontSize: 15, fontWeight: '600', color: colors.text },
  livreSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chapterGrid: { padding: 16 },
  chapterCell: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterCellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chapterCellText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chapterCellTextActive: { color: '#fff' },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 4 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  chapterNavTitle: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  versetsContent: { padding: 16 },
  verset: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  versetBookmarked: {
    backgroundColor: colors.bookmarkBg,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  versetNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 24,
    marginTop: 3,
    marginRight: 8,
  },
  versetText: { flex: 1, color: colors.text, lineHeight: 26, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  versetIcon: { marginTop: 4, marginLeft: 6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  settingsPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  settingsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  fontSizeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  fontSizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeBtnText: { fontWeight: '700', fontSize: 14 },
  settingsHint: { fontSize: 12, lineHeight: 18 },
});