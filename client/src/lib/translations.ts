// Translations for the application
export type LanguageCode = 'en' | 'fr';

type TranslationKey = 
  | 'toolsPanel.clear'
  | 'toolsPanel.undo'
  | 'toolsPanel.redo'
  | 'toolsPanel.zoomIn'
  | 'toolsPanel.zoomOut'
  | 'devicePanel.title'
  | 'devicePanel.dragTip'
  | 'devicePanel.computer'
  | 'devicePanel.laptop'
  | 'devicePanel.smartphone'
  | 'devicePanel.router'
  | 'devicePanel.switch'
  | 'devicePanel.server'
  | 'devicePanel.printer'
  | 'devicePanel.access_point'
  | 'devicePanel.repeater'
  | 'devicePanel.isp'
  | 'devicePanel.modem'
  | 'devicePanel.ont'
  | 'devicePanel.home_phone'
  | 'devicePanel.tablet'
  | 'devicePanel.tv'
  | 'devicePanel.wall_phone_jack'
  | 'devicePanel.connections'
  | 'devicePanel.wired'
  | 'devicePanel.wireless'
  | 'devicePanel.changeBackground'
  | 'devicePanel.connection_rj11'
  | 'devicePanel.connection_rj45'
  | 'devicePanel.connection_fiber'
  | 'devicePanel.connection_phone'
  | 'devicePanel.connection_main_cable'
  | 'canvas.tips.title'
  | 'canvas.tips.dragDevices'
  | 'canvas.tips.connections'
  | 'canvas.tips.doubleClick'
  | 'canvas.tips.rightClick'
  | 'canvas.tips.minimize'
  | 'canvas.tips.show'
  | 'dialog.removeDevice'
  | 'dialog.removeConnection'
  | 'dialog.enterDeviceName';

// English translations (default)
const en: Record<TranslationKey, string> = {
  'toolsPanel.clear': 'Clear All',
  'toolsPanel.undo': 'Undo',
  'toolsPanel.redo': 'Redo',
  'toolsPanel.zoomIn': 'Zoom In',
  'toolsPanel.zoomOut': 'Zoom Out',
  'devicePanel.title': 'Devices',
  'devicePanel.dragTip': 'Drag and drop devices to the canvas',
  'devicePanel.computer': 'Computer',
  'devicePanel.laptop': 'Laptop',
  'devicePanel.smartphone': 'Smartphone',
  'devicePanel.router': 'Router',
  'devicePanel.switch': 'Switch',
  'devicePanel.server': 'Server',
  'devicePanel.printer': 'Printer',
  'devicePanel.access_point': 'Access Point',
  'devicePanel.repeater': 'Repeater',
  'devicePanel.isp': 'ISP',
  'devicePanel.modem': 'Modem',
  'devicePanel.ont': 'ONT',
  'devicePanel.home_phone': 'Home Phone',
  'devicePanel.tablet': 'Tablet',
  'devicePanel.tv': 'Smart TV',
  'devicePanel.wall_phone_jack': 'Wall Phone Jack',
  'devicePanel.connections': 'Connections',
  'devicePanel.wired': 'Wired',
  'devicePanel.wireless': 'Wireless',
  'devicePanel.connection_rj11': 'RJ11 Cable',
  'devicePanel.connection_rj45': 'RJ45 Cable',
  'devicePanel.connection_fiber': 'Fiber Cable',
  'devicePanel.connection_phone': 'Phone Cable',
  'devicePanel.connection_main_cable': 'Main Cable',
  'devicePanel.changeBackground': 'Change Background',
  'canvas.tips.title': 'Tips',
  'canvas.tips.dragDevices': 'Drag devices from the sidebar',
  'canvas.tips.connections': 'Select connection type and click two devices to connect',
  'canvas.tips.doubleClick': 'Double-click a device to edit its label',
  'canvas.tips.rightClick': 'Right-click to remove devices or connections',
  'canvas.tips.minimize': 'Minimize',
  'canvas.tips.show': 'Show Tips',
  'dialog.removeDevice': 'Remove this device?',
  'dialog.removeConnection': 'Remove this connection?',
  'dialog.enterDeviceName': 'Enter device name:',
};

// French translations
const fr: Record<TranslationKey, string> = {
  'toolsPanel.clear': 'Tout Effacer',
  'toolsPanel.undo': 'Annuler',
  'toolsPanel.redo': 'Rétablir',
  'toolsPanel.zoomIn': 'Zoom Avant',
  'toolsPanel.zoomOut': 'Zoom Arrière',
  'devicePanel.title': 'Périphériques',
  'devicePanel.dragTip': 'Glisser et déposer les périphériques sur le canevas',
  'devicePanel.computer': 'Ordinateur',
  'devicePanel.laptop': 'Portable',
  'devicePanel.smartphone': 'Smartphone',
  'devicePanel.router': 'Routeur',
  'devicePanel.switch': 'Commutateur',
  'devicePanel.server': 'Serveur',
  'devicePanel.printer': 'Imprimante',
  'devicePanel.access_point': 'Point d\'Accès',
  'devicePanel.repeater': 'Répéteur',
  'devicePanel.isp': 'FAI',
  'devicePanel.modem': 'Modem',
  'devicePanel.ont': 'ONT',
  'devicePanel.home_phone': 'Téléphone Fixe',
  'devicePanel.tablet': 'Tablette',
  'devicePanel.tv': 'Télévision',
  'devicePanel.wall_phone_jack': 'Prise téléphonique murale',
  'devicePanel.connections': 'Connexions',
  'devicePanel.wired': 'Filaire',
  'devicePanel.wireless': 'Sans Fil',
  'devicePanel.connection_rj11': 'Câble RJ11',
  'devicePanel.connection_rj45': 'Câble RJ45',
  'devicePanel.connection_fiber': 'Câble Fibre',
  'devicePanel.connection_phone': 'Câble Téléphonique',
  'devicePanel.connection_main_cable': 'Câble Principal',
  'devicePanel.changeBackground': 'Changer l\'Arrière-plan',
  'canvas.tips.title': 'Astuces',
  'canvas.tips.dragDevices': 'Glisser les périphériques depuis la barre latérale',
  'canvas.tips.connections': 'Sélectionner le type de connexion et cliquer sur deux périphériques pour les connecter',
  'canvas.tips.doubleClick': 'Double-cliquer sur un périphérique pour modifier son étiquette',
  'canvas.tips.rightClick': 'Clic droit pour supprimer des périphériques ou des connexions',
  'canvas.tips.minimize': 'Réduire',
  'canvas.tips.show': 'Afficher les astuces',
  'dialog.removeDevice': 'Supprimer ce périphérique?',
  'dialog.removeConnection': 'Supprimer cette connexion?',
  'dialog.enterDeviceName': 'Entrer le nom du périphérique:',
};

// All translations
const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en,
  fr
};

// Get a translation
export function t(key: TranslationKey, lang: LanguageCode = 'en'): string {
  return translations[lang][key] || translations['en'][key];
}

// Default exports
export default translations;