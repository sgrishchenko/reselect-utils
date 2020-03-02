import React, { useMemo } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { SelectorGraph } from './SelectorGraph';
import { State } from '../__data__/state';
import { createAdaptedSelector } from '../createAdaptedSelector';
import { createStructuredSelector } from '../createStructuredSelector';

storiesOf('createAdaptedSelector', module).add('example', () => {
  const selectors = useMemo(() => {
    /* SELECTORS DEFINITION START */
    const personSelector = (state: State, props: { id: number }) =>
      state.persons[props.id];
    const messageSelector = (state: State, props: { id: number }) =>
      state.messages[props.id];

    const personAndMessageSelector = createStructuredSelector({
      person: createAdaptedSelector(
        personSelector,
        (props: { personId: number }) => ({
          id: props.personId,
        }),
      ),
      message: createAdaptedSelector(
        messageSelector,
        (props: { messageId: number }) => ({
          id: props.messageId,
        }),
      ),
    });
    /* SELECTORS DEFINITION END */

    return {
      personSelector,
      messageSelector,
      personAndMessageSelector,
    };
  }, []);

  return (
    <SelectorGraph
      selectors={selectors}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
