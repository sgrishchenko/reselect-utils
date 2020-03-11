import React, { FunctionComponent } from 'react';
import { useConfig } from 'docz';
import { ThemeProvider as ThemeUIProvider } from 'theme-ui';

export const ThemeProvider: FunctionComponent = ({ children }) => {
  const config = useConfig();
  return <ThemeUIProvider theme={config}>{children}</ThemeUIProvider>;
};
