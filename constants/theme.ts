/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#6A5ACD';
const tintColorDark = '#9B7EDE';

export const Colors = {
  light: {
    text: '#11181C',
    backgroundSurface: "#ECEDEE",
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#6A5ACD',
    primaryLight: '#9B7EDE',
    border: '#E0E0E0',
    placeholder: '#9E9E9E',
    success: '#4CAF50',
    successLight: '#E8F5E8',
  },
  dark : {
    text: '#11181C',
    backgroundSurface: "#ECEDEE",
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#6A5ACD',
    primaryLight: '#9B7EDE',
    border: '#E0E0E0',
    placeholder: '#9E9E9E',
    success: '#4CAF50',
    successLight: '#E8F5E8',
  }
  // dark: {
  //   text: '#ECEDEE',
  //   background: '#151718',
  //   tint: tintColorDark,
  //   icon: '#9BA1A6',
  //   tabIconDefault: '#9BA1A6',
  //   tabIconSelected: tintColorDark,
  //   primary: '#9B7EDE',
  //   primaryLight: '#B19CD9',
  //   border: '#404040',
  //   placeholder: '#6B6B6B',
  //   success: '#66BB6A',
  //   successLight: '#2E3A2E',
  // },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
