/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?(react-native|@react-native|@react-native-google-signin|expo(-.*)?|@expo(/.*)?|@expo-google-fonts|react-navigation|@react-navigation|@sentry|@unimodules|unimodules|sentry-expo|native-base|react-native-svg|@supabase|supabase-js|expo-modules-core)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = config
