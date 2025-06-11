module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      allowlist: null,
      blacklist: null,
      safe: false,
      allowUndefined: true,
    }],
  ],
};
