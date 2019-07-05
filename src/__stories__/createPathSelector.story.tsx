import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector } from 'reselect';
// @ts-ignore
import { selectorGraph, registerSelectors, reset } from 'reselect-tools';
import SelectorGraph from './SelectorGraph';
import { State } from '../__data__/state';
import createPathSelector from '../createPathSelector';

const personSelector = (state: State, props: { personId: number }) =>
  state.persons[props.personId];

const personFullNameSelector = createSelector(
  createPathSelector(personSelector).firstName(''),
  createPathSelector(personSelector).secondName(''),
  (firstName, secondName) => `${firstName} ${secondName}`,
);

const personShortNameSelector = createSelector(
  createPathSelector(personSelector).firstName(''),
  createPathSelector(personSelector).secondName(''),
  (firstName, secondName) => {
    const [firstLetter] = Array.from(secondName);
    return `${firstName} ${firstLetter}.`;
  },
);

storiesOf('createPathSelector', module).add('example', () => {
  reset();
  registerSelectors({
    personSelector,
    personFullNameSelector,
    personShortNameSelector,
  });

  const { nodes, edges } = selectorGraph();
  return (
    <SelectorGraph
      nodes={nodes}
      edges={edges}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
