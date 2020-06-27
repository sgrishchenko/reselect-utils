import React, { FunctionComponent } from 'react';
import { Container, useThemeUI } from 'theme-ui';
import { useCurrentDoc } from 'docz';
import { useMedia } from 'use-media';

export const MainContainer: FunctionComponent = ({ children }) => {
  const { theme } = useThemeUI();
  const { fullScreen } = useCurrentDoc() as Record<string, unknown>;
  const isMobile = useMedia({ maxWidth: `${920 / 16}em` });

  const padding = !fullScreen
    ? {
        paddingTop: isMobile
          ? (theme?.space?.[5] as number)
          : (theme?.space?.[4] as number),
        paddingBottom: theme?.space?.[4] as number,
        paddingLeft: theme?.space?.[4] as number,
        paddingRight: theme?.space?.[4] as number,
      }
    : {
        padding: 0,
      };

  const styles = {
    container: {
      backgroundColor: theme?.colors?.background,
      position: 'relative' as const,
      maxWidth: fullScreen ? '100%' : 1280,
      ...padding,
    },
  };

  return <Container style={styles.container}>{children}</Container>;
};
