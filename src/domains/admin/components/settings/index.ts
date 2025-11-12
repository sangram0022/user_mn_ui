/**
 * Settings Components Index
 * Barrel export for settings components
 */

export { default as GeneralSettingsSection } from './GeneralSettingsSection';
export { default as SecuritySettingsSection } from './SecuritySettingsSection';
export { default as EmailSettingsSection } from './EmailSettingsSection';
export { getDefaultSettings } from './defaultSettings';
export type { 
  GeneralSettings, 
  SecuritySettings, 
  EmailSettings, 
  ApiSettings,
  AllSettings 
} from './types';
