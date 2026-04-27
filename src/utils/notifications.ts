// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

// Configuration du handler de notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Demander les permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) {
    console.log('⚠️ Notifications désactivées dans Expo Go');
    return false;
  }

  if (!Device.isDevice) {
    console.log('⚠️ Notifications non disponibles sur simulateur');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission de notification refusée');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('verset-du-jour', {
        name: 'Verset du jour',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C47F17',
      });
    }

    console.log('✅ Permissions de notification accordées');
    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return false;
  }
}

// Obtenir un verset aléatoire depuis la bible
export function getRandomVersetFromBible(bibleData: any): { ref: string; texte: string } | null {
  if (!bibleData || !bibleData.livres || bibleData.livres.length === 0) {
    return null;
  }

  try {
    const livres = bibleData.livres;
    const validLivres = livres.filter((l: any) => l.chapitres && l.chapitres.length > 0);
    
    if (validLivres.length === 0) return null;
    
    const livre = validLivres[Math.floor(Math.random() * validLivres.length)];
    
    if (!livre.chapitres || livre.chapitres.length === 0) return null;
    
    const chapitre = livre.chapitres[Math.floor(Math.random() * livre.chapitres.length)];
    
    if (!chapitre.versets || chapitre.versets.length === 0) return null;
    
    const verset = chapitre.versets[Math.floor(Math.random() * chapitre.versets.length)];
    
    return {
      ref: `${livre.nom} ${chapitre.numero}:${verset.numero}`,
      texte: verset.texte,
    };
  } catch (e) {
    console.error('Erreur lors de la sélection du verset aléatoire:', e);
    return null;
  }
}

// Versets de secours par langue
const FALLBACK_VERSES: Record<string, Array<{ ref: string; texte: string }>> = {
  fr: [
    { ref: 'Jean 3:16', texte: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique...' },
    { ref: 'Psaumes 23:1', texte: 'L\'Éternel est mon berger : je ne manquerai de rien.' },
    { ref: 'Matthieu 5:3', texte: 'Heureux les pauvres en esprit, car le royaume des cieux est à eux !' },
  ],
  en: [
    { ref: 'John 3:16', texte: 'For God so loved the world that he gave his one and only Son...' },
    { ref: 'Psalm 23:1', texte: 'The Lord is my shepherd; I shall not want.' },
    { ref: 'Matthew 5:3', texte: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
  ],
  mg: [
    { ref: 'Jaona 3:16', texte: 'Fa Andriamanitra dia tia an\'izao tontolo izao tokoa...' },
    { ref: 'Salamo 23:1', texte: 'Jehovah no Mpiandriko, tsy ho tsy hanan-javatra aho.' },
    { ref: 'Matio 5:3', texte: 'Sambatra izay malahelo amin\'ny fanahy, fa azy ny fanjakan\'ny lanitra.' },
  ],
};

function getFallbackVerse(lang: string): { ref: string; texte: string } {
  const verses = FALLBACK_VERSES[lang] || FALLBACK_VERSES.fr;
  return verses[Math.floor(Math.random() * verses.length)];
}

// Planifier la notification quotidienne à 7h00
export async function scheduleDailyVerseNotification(bibleData?: any, lang: string = 'fr'): Promise<void> {
  if (isExpoGo) {
    console.log('⚠️ Notifications quotidiennes désactivées dans Expo Go');
    return;
  }

  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      console.log('❌ Permissions non accordées, impossible de planifier');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    let verset = getRandomVersetFromBible(bibleData);
    if (!verset) {
      verset = getFallbackVerse(lang);
    }

    const titles: Record<string, string> = {
      fr: '📖 Verset du jour',
      en: '📖 Verse of the day',
      mg: '📖 Baibolin\'ny andro'
    };
    const title = titles[lang] || titles.fr;

    // Calculer l'heure de la prochaine notification
    const scheduledTime = new Date();
    scheduledTime.setHours(7, 0, 0, 0);
    
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Déclaration du trigger avec typage explicite
    const trigger: { date: Date; repeats: boolean } = {
      date: scheduledTime,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: `${verset.ref}\n\n"${verset.texte}"`,
        sound: true,
        data: { ref: verset.ref, texte: verset.texte, lang: lang },
      },
      trigger: trigger,
    });

    console.log(`✅ Notification quotidienne planifiée à 7h00 en ${lang}`);
  } catch (error) {
    console.error('❌ Erreur planification notification:', error);
  }
}

// Envoyer une notification immédiate (test)
export async function sendTestNotification(bibleData?: any, lang: string = 'fr'): Promise<void> {
  if (isExpoGo) {
    console.log('📱 Notifications test désactivées dans Expo Go');
    const verset = getRandomVersetFromBible(bibleData) || getFallbackVerse(lang);
    Alert.alert(
      '📖 Verset du jour',
      `${verset.ref}\n\n"${verset.texte}"`,
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    let verset = getRandomVersetFromBible(bibleData);
    if (!verset) {
      verset = getFallbackVerse(lang);
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Verset du jour',
        body: `${verset.ref}\n\n"${verset.texte}"`,
        sound: true,
      },
      trigger: null,
    });
    console.log('✅ Notification test envoyée');
  } catch (error) {
    console.error('❌ Erreur envoi notification test:', error);
  }
}

// Annuler toutes les notifications
export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo) return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Toutes les notifications ont été annulées');
  } catch (error) {
    console.error('❌ Erreur annulation:', error);
  }
}

export { FALLBACK_VERSES };