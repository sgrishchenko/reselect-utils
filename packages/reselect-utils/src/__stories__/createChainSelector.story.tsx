import React, { useMemo, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector, Selector } from 'reselect';
import { Message, Person, commonState, State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createSequenceSelector } from '../createSequenceSelector';
import { createChainSelector } from '../createChainSelector';
import { ChainSelectorGraph } from './ChainSelectorGraph';

storiesOf('createChainSelector', module)
  .add('entity chain example', () => {
    const [called, setCalled] = useState(false);

    const selectors = useMemo(() => {
      /* SELECTORS DEFINITION START */
      const personSelector = (state: State, props: { id: number }) =>
        state.persons[props.id];
      const messageSelector = (state: State, props: { id: number }) =>
        state.messages[props.id];
      const documentSelector = (state: State, props: { id: number }) =>
        state.documents[props.id];

      const fullNameSelector = createSelector(
        [personSelector],
        ({ firstName = '', secondName = '' }) => `${firstName} ${secondName}`,
      );

      const personByDocumentIdSelector = createChainSelector(documentSelector)
        .chain((document) =>
          createBoundSelector(messageSelector, { id: document.messageId }),
        )
        .chain((message) =>
          createBoundSelector(fullNameSelector, { id: message.personId }),
        )
        .build();
      /* SELECTORS DEFINITION END */

      if (called) {
        const personByDocumentId = personByDocumentIdSelector(commonState, {
          id: 111,
        });

        action('personByDocumentId')(personByDocumentId);
      }

      return {
        personSelector,
        messageSelector,
        documentSelector,
        fullNameSelector,
        personByDocumentIdSelector,
      };
    }, [called]);

    return (
      <ChainSelectorGraph
        selectors={selectors}
        onCallButtonClick={() => setCalled(true)}
      />
    );
  })
  .add('aggregation example', () => {
    const [called, setCalled] = useState(false);

    const selectors = useMemo(() => {
      /* SELECTORS DEFINITION START */
      const personsSelector = (state: State) => state.persons;

      const personSelector = (state: State, props: { id: number }) =>
        state.persons[props.id];

      const fullNameSelector = createSelector(
        [personSelector],
        ({ firstName = '', secondName = '' }) => `${firstName} ${secondName}`,
      );

      const longestFullNameSelector = createChainSelector(personsSelector)
        .chain((persons) =>
          createSequenceSelector(
            Object.values(persons).map((person) =>
              createBoundSelector(fullNameSelector, { id: person.id }),
            ),
          ),
        )
        .map((fullNames) =>
          fullNames.reduce((longest, current) =>
            current.length > longest.length ? current : longest,
          ),
        )
        .build();
      /* SELECTORS DEFINITION END */

      if (called) {
        const longestFullName = longestFullNameSelector(commonState);

        action('longestFullName')(longestFullName);
      }

      return {
        personSelector,
        personsSelector,
        fullNameSelector,
        longestFullNameSelector,
      };
    }, [called]);

    return (
      <ChainSelectorGraph
        selectors={selectors}
        onCallButtonClick={() => setCalled(true)}
      />
    );
  })
  .add('switch dependency example', () => {
    const [documentId, setDocumentId] = useState<number>();

    const selectors = useMemo(() => {
      /* SELECTORS DEFINITION START */
      const personSelector = (state: State, props: { id: number }) =>
        state.persons[props.id];
      const messageSelector = (state: State, props: { id: number }) =>
        state.messages[props.id];
      const documentSelector = (state: State, props: { id: number }) =>
        state.documents[props.id];

      const personOrMessageByDocumentIdSelector = createChainSelector(
        documentSelector,
      )
        .chain(
          (document) =>
            (document.messageId === 100
              ? createBoundSelector(personSelector, { id: 1 })
              : createBoundSelector(messageSelector, {
                  id: document.messageId,
                })) as Selector<State, Person | Message>,
        )
        .build();
      /* SELECTORS DEFINITION END */

      if (documentId !== undefined) {
        const personOrMessageByDocumentId = personOrMessageByDocumentIdSelector(
          commonState,
          {
            id: documentId,
          },
        );

        action('personOrMessageByDocumentId')(personOrMessageByDocumentId);
      }

      return {
        personSelector,
        messageSelector,
        documentSelector,
        personOrMessageByDocumentIdSelector,
      };
    }, [documentId]);

    return (
      <ChainSelectorGraph
        selectors={selectors}
        onCallButtonClick={() => setDocumentId(documentId === 111 ? 222 : 111)}
      />
    );
  });
