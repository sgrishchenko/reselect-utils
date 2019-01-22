import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector } from 'reselect';
// @ts-ignore
import { selectorGraph, registerSelectors, reset } from 'reselect-tools';
import SelectorGraph from './SelectorGraph';
import { State } from '../__data__/state';
import createPathSelector from '../createPathSelector';

const getPerson = (state: State, props: { personId: number }) =>
  state.persons[props.personId];

const getPersonFullName = createSelector(
  createPathSelector(getPerson).firstName(''),
  createPathSelector(getPerson).secondName(''),
  (firstName, secondName) => `${firstName} ${secondName}`,
);

const getPersonShortName = createSelector(
  createPathSelector(getPerson).firstName(''),
  createPathSelector(getPerson).secondName(''),
  (firstName, secondName) => {
    const [firstLetter] = Array.from(secondName);
    return `${firstName} ${firstLetter}.`;
  },
);

storiesOf('createPathSelector', module).add('example', () => {
  reset();
  registerSelectors({
    getPerson,
    getPersonFullName,
    getPersonShortName,
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
