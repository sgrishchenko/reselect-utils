import React, { useMemo } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector } from 'reselect';
import { SelectorGraph } from './SelectorGraph';
import { State } from '../__data__/state';
import { createPathSelector } from '../createPathSelector';

storiesOf('createPathSelector', module).add('example', () => {
  const selectors = useMemo(() => {
    /* SELECTORS DEFINITION START */
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
    /* SELECTORS DEFINITION END */

    return {
      personSelector,
      personFullNameSelector,
      personShortNameSelector,
    };
  }, []);

  return (
    <SelectorGraph
      selectors={selectors}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
