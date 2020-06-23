import React, { FunctionComponent } from 'react';
import { useColorMode } from 'theme-ui';
import { ExternalLink } from '../ExternalLink';

export type StorybookFrameProps = {
  title: string;
  route: string;
};

export const StorybookFrame: FunctionComponent<StorybookFrameProps> = ({
  title,
  route,
}) => {
  const [colorMode] = useColorMode();

  const base = `https://sgrishchenko.github.io/reselect-utils/storybook`;
  const linkSource = `${base}/?path=/story/${route}`;
  const frameSource = `${base}/iframe.html?id=${route}&theme=${colorMode}`;

  const styles = {
    container: {
      position: 'relative' as const,
      display: 'inline-flex',
    },
    frame: {
      resize: 'both' as const,
      overflow: 'auto',
      width: '640px',
      height: '350px',
      maxWidth: '100%',
      borderStyle: 'solid',
      padding: '10px',
      boxSizing: 'border-box' as const,
    },
  };

  return (
    <div style={styles.container}>
      <ExternalLink source={linkSource} top={5} right={10} />
      <iframe title={title} style={styles.frame} src={frameSource} />
    </div>
  );
};
