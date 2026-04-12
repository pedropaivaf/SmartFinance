import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeApp } from './utils/platform';

export async function initNative() {
  if (!isNativeApp()) return;

  try {
    await StatusBar.setStyle({ style: Style.Default });
  } catch {}

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      CapacitorApp.exitApp();
    }
  });

  try {
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {}
}
