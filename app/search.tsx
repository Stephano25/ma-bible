import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useBible } from '../src/context/BibleContext';

interface SearchResult {
  bookIndex: number;
  bookName: string;
  chapterIndex: number;
  chapterNum: number;
  versetNum: number;
  texte: string;
  testament: string;
}

export default function RechercheScreen() {
  const { colors } = useTheme();
  const { bibleData, lang, fontSize } = useBible();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ancien' | 'nouveau'>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((text: string, f = filter) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim() || text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const term = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const found: SearchResult[] = [];
      const livres = bibleData?.livres || [];

      for (let bi = 0; bi < livres.length; bi++) {
        const livre = livres[bi];
        if (f !== 'all' && livre.testament !== f) continue;
        const chapitres = livre.chapitres || [];
        for (let ci = 0; ci < chapitres.length; ci++) {
          const chapitre = chapitres[ci];
          const versets = chapitre.versets || [];
          for (const verset of versets) {
            const normalized = verset.texte.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (normalized.includes(term)) {
              found.push({
                bookIndex: bi,
                bookName: livre.nom,
                chapterIndex: ci,
                chapterNum: ci + 1,
                versetNum: verset.numero,
                texte: verset.texte,
                testament: livre.testament,
              });
              if (found.length >= 200) break;
            }
          }
          if (found.length >= 200) break;
        }
        if (found.length >= 200) break;
      }

      setResults(found);
      setLoading(false);
    }, 300);
  }, [bibleData, filter]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    search(text, filter);
  };

  const handleFilterChange = (f: 'all' | 'ancien' | 'nouveau') => {
    setFilter(f);
    search(query, f);
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return <Text style={[styles.resultText, { fontSize: fontSize - 2 }]}>{text}</Text>;
    const term = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(term);
    if (idx === -1) return <Text style={[styles.resultText, { fontSize: fontSize - 2, color: colors.text }]}>{text}</Text>;

    return (
      <Text style={[styles.resultText, { fontSize: fontSize - 2, color: colors.text }]}>
        {text.substring(0, idx)}
        <Text style={{ backgroundColor: colors.highlightBg, color: colors.highlightText, fontWeight: '700' }}>
          {text.substring(idx, idx + term.length)}
        </Text>
        {text.substring(idx + term.length)}
      </Text>
    );
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rechercher</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { fontSize: 16, color: colors.text }]}
          placeholder={lang === 'fr' ? 'Rechercher un mot ou verset...' : 'Search a word or verse...'}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleQueryChange}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Résultats count + filtres */}
      {query.length >= 2 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {loading ? '...' : `${results.length} résultat${results.length > 1 ? 's' : ''}${results.length >= 200 ? ' (max)' : ''}`}
            {query ? ` pour "${query}"` : ''}
          </Text>
          <View style={styles.filterRow}>
            {(['all', 'ancien', 'nouveau'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                onPress={() => handleFilterChange(f)}
              >
                <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                  {f === 'all' ? 'Tout' : f === 'ancien' ? 'A. Testament' : 'N. Testament'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aucun résultat</Text>
        </View>
      )}

      {!loading && query.length < 2 && (
        <View style={styles.placeholder}>
          <Ionicons name="book-outline" size={52} color={colors.textMuted} />
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            {lang === 'fr' ? 'Tapez au moins 2 lettres pour chercher dans toute la Bible' : 'Type at least 2 letters to search the entire Bible'}
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, i) => String(i)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
              Keyboard.dismiss();
              router.push({
                pathname: '/read',
                params: { bookIndex: item.bookIndex, chapterIndex: item.chapterIndex },
              });
            }}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultRef}>
                {item.bookName} {item.chapterNum}:{item.versetNum}
              </Text>
              <View style={[styles.testamentBadge, { backgroundColor: item.testament === 'ancien' ? colors.surfaceAlt : colors.primary + '20' }]}>
                <Text style={[styles.testamentBadgeText, { color: item.testament === 'ancien' ? colors.textSecondary : colors.primary }]}>
                  {item.testament === 'ancien' ? 'A.T.' : 'N.T.'}
                </Text>
              </View>
            </View>
            {highlightText(item.texte, query)}
          </TouchableOpacity>
        )}
      />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, padding: 0 },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  resultsCount: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterBtnTextActive: { color: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  placeholderText: { textAlign: 'center', lineHeight: 22 },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultRef: { fontSize: 14, fontWeight: '700', color: colors.primary },
  testamentBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  testamentBadgeText: { fontSize: 11, fontWeight: '700' },
  resultText: { lineHeight: 22 },
});