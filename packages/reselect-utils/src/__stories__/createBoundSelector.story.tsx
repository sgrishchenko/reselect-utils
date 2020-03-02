import React, { useMemo } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SelectorGraph } from './SelectorGraph';
import { State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createStructuredSelector } from '../createStructuredSelector';

storiesOf('createBoundSelector', module).add('example', () => {
  const selectors = useMemo(() => {
    /* SELECTORS DEFINITION START */
    const personSelector = (state: State, props: { id: number }) =>
      state.persons[props.id];
    const messageSelector = (state: State, props: { id: number }) =>
      state.messages[props.id];

    const marryAndHelloSelector = createStructuredSelector({
      person: createBoundSelector(personSelector, { id: 1 }),
      message: createBoundSelector(messageSelector, { id: 100 }),
    });
    /* SELECTORS DEFINITION END */

    return {
      personSelector,
      messageSelector,
      marryAndHelloSelector,
    };
  }, []);

  return (
    <SelectorGraph
      selectors={selectors}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
