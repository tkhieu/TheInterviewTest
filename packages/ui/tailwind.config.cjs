module.exports = {
  presets: [require('./tailwind.preset.cjs')],
  content: [
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx,html}',
  ],
};
