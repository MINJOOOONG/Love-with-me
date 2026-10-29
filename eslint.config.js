// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Node 로 실행하는 그림 생성 스크립트
    files: ['scripts/**/*.js'],
    languageOptions: { globals: { __dirname: 'readonly', Buffer: 'readonly', require: 'readonly' } },
  },
]);
