const uiPreset = require('@campaign-manager/ui/tailwind.preset.cjs');

module.exports = {
  presets: [uiPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../ui/src/**/*.{ts,tsx}',
  ],
};
