import * as SecureStore from 'expo-secure-store';

// Clerk needs a persistent, secure place to cache session tokens between
// app launches. SecureStore (Keychain on iOS, EncryptedSharedPreferences
// on Android) is Clerk's documented choice for Expo.
export const clerkTokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore — worst case the user has to sign in again
    }
  },
};
