const nextPlugin = require('@next/eslint-plugin-next');

module.exports = [
  {
    ignores: [".next/"],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];