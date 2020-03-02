import React, { FunctionComponent } from 'react';
import { action } from '@storybook/addon-actions';
import { AnySelector } from 'reselect-tools';
import { SelectorGraph } from './SelectorGraph';

type ChainSelectorGraphProps = {
  selectors: Record<string, AnySelector>;
  onCallButtonClick: () => void;
};

export const ChainSelectorGraph: FunctionComponent<ChainSelectorGraphProps> = ({
  selectors,
  onCallButtonClick,
}) => {
  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <div style={containerStyle}>
      <div>
        <button type="button" onClick={onCallButtonClick}>
          Call Chain Selector
        </button>
      </div>
      <SelectorGraph
        selectors={selectors}
        onNodeClick={(name, node) => action(name)(node)}
        style={{ height: undefined, flexGrow: 1 }}
      />
    </div>
  );
};
