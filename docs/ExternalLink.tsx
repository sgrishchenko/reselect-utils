import React, { FunctionComponent } from 'react';
import { useThemeUI } from 'theme-ui';
import { ExternalLink as ExternalLinkIcon } from 'react-feather';

export type ExternalLinkProps = {
  source: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export const ExternalLink: FunctionComponent<ExternalLinkProps> = ({
  source,
  top,
  bottom,
  left,
  right,
}) => {
  const { theme } = useThemeUI();

  const styles = {
    link: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute' as const,
      top,
      bottom,
      left,
      right,
      backgroundColor: 'transparent',
      color: theme?.colors?.muted,
      fontSize: theme?.fontSizes?.[1] as number,
      textDecoration: 'none',
    },
    linkTitle: {
      paddingLeft: theme?.space?.[2] as number,
    },
  };

  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.link}
    >
      <ExternalLinkIcon width={14} />
      <div style={styles.linkTitle}>View in full screen</div>
    </a>
  );
};
