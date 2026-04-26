import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../tokens.css';
import './storybook.css';

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/ } },
    layout: 'padded',
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
  ],
};
export default preview;
