import React, { FunctionComponent, CSSProperties } from 'react';
import { useColorMode } from 'theme-ui';

export type StorybookFrameProps = {
  title: string;
  route: string;
};

export const StorybookFrame: FunctionComponent<StorybookFrameProps> = ({
  title,
  route,
}) => {
  const [colorMode] = useColorMode();

  const style: CSSProperties = {
    resize: 'both',
    overflow: 'auto',
    width: '640px',
    height: '350px',
    maxWidth: '100%',
    borderStyle: 'solid',
    padding: '10px',
    boxSizing: 'border-box',
  };

  return (
    <iframe
      title={title}
      style={style}
      src={`https://sgrishchenko.github.io/reselect-utils/storybook/iframe.html?id=${route}&theme=${colorMode}`}
    />
  );
};
