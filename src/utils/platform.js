import { Capacitor } from '@capacitor/core';

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export function nativePlatform() {
  return Capacitor.getPlatform();
}
