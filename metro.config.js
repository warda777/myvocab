// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withShareExtension } = require("expo-share-extension/metro");

module.exports = withShareExtension(getDefaultConfig(__dirname), {
  // Web-only: optional
  isCSSEnabled: true,
});
