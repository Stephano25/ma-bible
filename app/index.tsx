// app/index.tsx
// ============================================================
//  ÉCRAN ACCUEIL
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useBible } from '../src/context/BibleContext';
import { getRandomVersetFromBible } from '../src/utils/notifications';

export default function AccueilScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { bibleData, lang, setLang, lastPosition, bookmarks, fontSize } = useBible();
  const router = useRouter();
  const [versetJour, setVersetJour] = useState({ ref: '', texte: '' });

  useEffect(() => {
    // Verset du jour aléatoire depuis la bible actuelle
    const verset = getRandomVersetFromBible(bibleData);
    if (verset) {
      setVersetJour(verset);
    }
  }, [bibleData]);

  const livres = bibleData?.livres || [];
  const progressPercent = lastPosition && livres.length > 0
    ? Math.round(((lastPosition.bookIndex + 1) / livres.length) * 100)
    : 0;

  const styles = makeStyles(colors);

  const partagerVerset = async () => {
    try {
      await Share.share({
        message: `📖 ${versetJour.ref}\n\n"${versetJour.texte}"\n\n— Ma Bible App`,
      });
    } catch (e) {}
  };

  // Ordre des langues
  const getNextLang = () => {
    const order: Record<string, 'fr' | 'en' | 'mg'> = {
      'fr': 'en',
      'en': 'mg',
      'mg': 'fr'
    };
    return order[lang];
  };

  // Nom de la bible selon la langue
  const getBibleName = () => {
    switch(lang) {
      case 'fr': return 'Louis Segond 1910';
      case 'en': return 'King James Version';
      case 'mg': return 'Baiboly Malagasy';
      default: return 'Louis Segond 1910';
    }
  };

  // Drapeau selon la langue
  const getFlag = () => {
    switch(lang) {
      case 'fr': return '🇫🇷 FR';
      case 'en': return '🇬🇧 EN';
      case 'mg': return '🇲🇬 MG';
      default: return '🇫🇷 FR';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ma Bible</Text>
          <Text style={styles.headerSub}>{getBibleName()}</Text>
        </View>
        <View style={styles.headerActions}>
          {/* Langue - 3 options */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLang(getNextLang())}
          >
            <Text style={styles.langBtnText}>{getFlag()}</Text>
          </TouchableOpacity>
          {/* Thème */}
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Verset du jour - SANS LE BOUTON DE TEST */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="sunny" size={18} color={colors.accent} />
            <Text style={styles.cardTitle}>
              {lang === 'fr' ? 'Verset du jour' : lang === 'en' ? 'Verse of the day' : 'Baibolin\'ny andro'}
            </Text>
            <TouchableOpacity onPress={partagerVerset} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.versetTexte, { fontSize }]}>"{versetJour.texte}"</Text>
          <Text style={styles.versetRef}>{versetJour.ref}</Text>
          {/* BOUTON DE TEST SUPPRIMÉ */}
        </View>

        {/* Continuer la lecture */}
        {lastPosition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {lang === 'fr' ? 'Continuer la lecture' : lang === 'en' ? 'Continue reading' : 'Hanohy famakiana'}
            </Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => router.push({ 
                pathname: '/read', 
                params: { 
                  bookIndex: lastPosition.bookIndex, 
                  chapterIndex: lastPosition.chapterIndex 
                } 
              })}
            >
              <View style={styles.continueAvatar}>
                <Text style={styles.continueAvatarText}>
                  {lastPosition.bookName?.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.continueInfo}>
                <Text style={styles.continueName}>{lastPosition.bookName}</Text>
                <Text style={styles.continueSub}>
                  {lang === 'fr' ? 'Chapitre' : lang === 'en' ? 'Chapter' : 'Toko'} {lastPosition.chapterNum}
                </Text>
                <Text style={[styles.continueSub, { color: colors.accent }]}>
                  {lang === 'fr' ? 'Reprendre →' : lang === 'en' ? 'Resume →' : 'Hanohy →'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Accès rapide testaments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {lang === 'fr' ? 'Accès rapide' : lang === 'en' ? 'Quick access' : 'Fidirana haingana'}
          </Text>
          <View style={styles.testamentRow}>
            <TouchableOpacity
              style={[styles.testamentCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push({ pathname: '/read', params: { testament: 'ancien' } })}
            >
              <Text style={styles.testamentTitle}>
                {lang === 'fr' ? 'Ancien\nTestament' : lang === 'en' ? 'Old\nTestament' : 'Testamenta\nTaloha'}
              </Text>
              <Text style={styles.testamentCount}>39 {lang === 'fr' ? 'livres' : lang === 'en' ? 'books' : 'boky'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testamentCard, { backgroundColor: colors.primaryDark }]}
              onPress={() => router.push({ pathname: '/read', params: { testament: 'nouveau' } })}
            >
              <Text style={styles.testamentTitle}>
                {lang === 'fr' ? 'Nouveau\nTestament' : lang === 'en' ? 'New\nTestament' : 'Testamenta\nVaovao'}
              </Text>
              <Text style={styles.testamentCount}>27 {lang === 'fr' ? 'livres' : lang === 'en' ? 'books' : 'boky'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lien vers la liste des livres */}
        <TouchableOpacity
          style={styles.bookListBtn}
          onPress={() => router.push('/book')}
        >
          <Ionicons name="library" size={20} color={colors.primary} />
          <Text style={[styles.bookListBtnText, { color: colors.primary }]}>
            {lang === 'fr' ? 'Voir tous les livres →' : lang === 'en' ? 'See all books →' : 'Hijery ny boky rehetra →'}
          </Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>
              {lang === 'fr' ? 'Favoris' : lang === 'en' ? 'Favorites' : 'Tiany'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{livres.length}</Text>
            <Text style={styles.statLabel}>
              {lang === 'fr' ? 'Livres' : lang === 'en' ? 'Books' : 'Boky'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progressPercent}%</Text>
            <Text style={styles.statLabel}>
              {lang === 'fr' ? 'Progression' : lang === 'en' ? 'Progress' : 'Fandrosoana'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: colors.headerText, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  themeBtn: { padding: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.primary, flex: 1 },
  shareBtn: { padding: 4 },
  versetTexte: { color: colors.text, fontStyle: 'italic', lineHeight: 28, marginBottom: 10 },
  versetRef: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  continueCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  continueAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  continueAvatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  continueInfo: { flex: 1 },
  continueName: { fontSize: 15, fontWeight: '700', color: colors.text },
  continueSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  testamentRow: { flexDirection: 'row', gap: 12 },
  testamentCard: {
    flex: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testamentTitle: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  testamentCount: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  bookListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bookListBtnText: { fontSize: 14, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});