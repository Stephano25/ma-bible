module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // N'INCLUE PAS react-native-reanimated/plugin
  };
};