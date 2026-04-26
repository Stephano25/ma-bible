// src/utils/notifications.ts
// ============================================================
//  NOTIFICATIONS QUOTIDIENNES — Verset du jour en français
// ============================================================
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Demander les permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications non disponibles sur simulateur');
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
      console.log('Permission de notification refusée');
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

    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return false;
  }
}

// Versets inspirants en français (fallback si bible non chargée)
export const VERSETS_INSPIRANTS_FR = [
  { ref: 'Jean 3:16', texte: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.' },
  { ref: 'Psaumes 23:1', texte: 'L\'Éternel est mon berger : je ne manquerai de rien.' },
  { ref: 'Matthieu 5:3', texte: 'Heureux les pauvres en esprit, car le royaume des cieux est à eux !' },
  { ref: 'Proverbes 3:5', texte: 'Confie-toi en l\'Éternel de tout ton cœur, et ne t\'appuie pas sur ta sagesse.' },
  { ref: 'Philippiens 4:13', texte: 'Je puis tout par celui qui me fortifie.' },
  { ref: 'Romains 8:28', texte: 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu.' },
  { ref: 'Ésaïe 40:31', texte: 'Mais ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.' },
  { ref: 'Jérémie 29:11', texte: 'Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l\'espérance.' },
  { ref: 'Psaumes 46:1', texte: 'Dieu est pour nous un refuge et un appui, un secours qui ne manque jamais dans la détresse.' },
  { ref: '1 Corinthiens 13:4', texte: 'L\'amour est patient, il est plein de bonté ; l\'amour n\'est point envieux ; l\'amour ne se vante point, il ne s\'enfle point d\'orgueil.' },
  { ref: 'Matthieu 6:33', texte: 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.' },
  { ref: 'Psaumes 119:105', texte: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.' },
  { ref: 'Jacques 1:5', texte: 'Si quelqu\'un d\'entre vous manque de sagesse, qu\'il la demande à Dieu, qui donne à tous libéralement et sans reproche, et elle lui sera donnée.' },
  { ref: '2 Timothée 1:7', texte: 'Car ce n\'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d\'amour et de sagesse.' },
  { ref: 'Hébreux 11:1', texte: 'Or la foi est une ferme assurance des choses qu\'on espère, une démonstration de celles qu\'on ne voit pas.' },
  { ref: 'Apocalypse 21:4', texte: 'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n\'y aura plus ni deuil, ni cri, ni douleur.' },
  { ref: '1 Jean 4:8', texte: 'Celui qui n\'aime pas n\'a pas connu Dieu, car Dieu est amour.' },
  { ref: 'Galates 5:22', texte: 'Mais le fruit de l\'Esprit, c\'est l\'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité.' },
  { ref: 'Esaïe 41:10', texte: 'Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.' },
  { ref: 'Matthieu 11:28', texte: 'Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.' },
];

// Obtenir un verset aléatoire depuis la bible complète ou depuis la liste de secours
export function getRandomVersetFR(bibleData?: any): { ref: string; texte: string } {
  // Vérifier si bibleData est valide
  if (bibleData && bibleData.livres && Array.isArray(bibleData.livres) && bibleData.livres.length > 0) {
    try {
      const livres = bibleData.livres;
      // Filtrer les livres qui ont des chapitres
      const validLivres = livres.filter((l: any) => l.chapitres && l.chapitres.length > 0);
      
      if (validLivres.length > 0) {
        const livre = validLivres[Math.floor(Math.random() * validLivres.length)];
        
        if (livre && livre.chapitres && livre.chapitres.length > 0) {
          const chapitre = livre.chapitres[Math.floor(Math.random() * livre.chapitres.length)];
          
          if (chapitre && chapitre.versets && Array.isArray(chapitre.versets) && chapitre.versets.length > 0) {
            const verset = chapitre.versets[Math.floor(Math.random() * chapitre.versets.length)];
            return {
              ref: `${livre.nom} ${chapitre.numero}:${verset.numero}`,
              texte: verset.texte,
            };
          }
        }
      }
    } catch (e) {
      console.error('Erreur lors de la sélection du verset aléatoire:', e);
    }
  }
  
  // Fallback: verset depuis la liste inspirante
  return VERSETS_INSPIRANTS_FR[Math.floor(Math.random() * VERSETS_INSPIRANTS_FR.length)];
}

// Planifier la notification quotidienne à 8h00
export async function scheduleDailyVerseNotification(bibleData?: any): Promise<void> {
  try {
    // Vérifier si les permissions sont accordées
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      console.log('Permissions non accordées, impossible de planifier les notifications');
      return;
    }

    // Annuler toutes les notifications existantes
    await Notifications.cancelAllScheduledNotificationsAsync();

    const verset = getRandomVersetFR(bibleData);

    // Planifier la notification quotidienne
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Verset du jour',
        body: `${verset.ref}\n\n"${verset.texte}"`,
        sound: true,
        data: { ref: verset.ref, texte: verset.texte, type: 'daily-verse' },
        ...(Platform.OS === 'android' && { channelId: 'verset-du-jour' }),
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });

    console.log('✅ Notification quotidienne planifiée à 8h00');
  } catch (error) {
    console.error('❌ Erreur planification notification:', error);
  }
}

// Envoyer une notification immédiate (test)
export async function sendTestNotification(bibleData?: any): Promise<void> {
  try {
    const verset = getRandomVersetFR(bibleData);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Verset du jour',
        body: `${verset.ref}\n\n"${verset.texte}"`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'verset-du-jour' }),
      },
      trigger: null, // Immédiat
    });
    console.log('✅ Notification test envoyée');
  } catch (error) {
    console.error('❌ Erreur envoi notification test:', error);
  }
}

// Annuler toutes les notifications programmées
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Toutes les notifications ont été annulées');
  } catch (error) {
    console.error('❌ Erreur annulation des notifications:', error);
  }
}

// Replanifier la notification avec un nouvel horaire
export async function rescheduleNotification(
  bibleData?: any, 
  hour: number = 8, 
  minute: number = 0
): Promise<void> {
  try {
    await cancelAllNotifications();
    
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      console.log('Permissions non accordées');
      return;
    }

    const verset = getRandomVersetFR(bibleData);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Verset du jour',
        body: `${verset.ref}\n\n"${verset.texte}"`,
        sound: true,
        data: { ref: verset.ref, texte: verset.texte },
        ...(Platform.OS === 'android' && { channelId: 'verset-du-jour' }),
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    });
    
    console.log(`✅ Notification replanifiée à ${hour}:${minute}`);
  } catch (error) {
    console.error('❌ Erreur replanification:', error);
  }
}

// Vérifier si les notifications sont supportées
export function areNotificationsSupported(): boolean {
  return Device.isDevice;
}