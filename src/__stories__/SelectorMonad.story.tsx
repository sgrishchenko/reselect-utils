import React, { CSSProperties } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector } from 'reselect';
// @ts-ignore
import { selectorGraph, registerSelectors, reset } from 'reselect-tools';
import SelectorGraph from './SelectorGraph';
import { Message, Person, commonState, State } from '../__data__/state';
import createBoundSelector from '../createBoundSelector';
import createSequenceSelector from '../createSequenceSelector';
import SelectorMonad from '../SelectorMonad';
import { Selector } from '../types';
/* tslint:disable:member-ordering */

const personSelector = (state: State, props: { id: number }) =>
  state.persons[props.id];
const messageSelector = (state: State, props: { id: number }) =>
  state.messages[props.id];
const documentSelector = (state: State, props: { id: number }) =>
  state.documents[props.id];

const fullNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

class SelectorMonadGraph extends React.Component<{
  onCallButtonClick?: () => void;
}> {
  private containerStyle: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  private onCallButtonClick = () => {
    const { onCallButtonClick } = this.props;
    if (onCallButtonClick) {
      onCallButtonClick();
    }

    this.forceUpdate();
  };

  public render() {
    const { nodes, edges } = selectorGraph();

    return (
      <div style={this.containerStyle}>
        <div>
          <button type="button" onClick={this.onCallButtonClick}>
            Call monadic selector
          </button>
        </div>
        <SelectorGraph
          nodes={nodes}
          edges={edges}
          onNodeClick={(name, node) => action(name)(node)}
          style={{ height: undefined, flexGrow: 1 }}
        />
      </div>
    );
  }
}

storiesOf('SelectorMonad', module)
  .add('entity chain example', () => {
    const personByDocumentIdSelector = SelectorMonad.of(documentSelector)
      .chain(document =>
        createBoundSelector(messageSelector, { id: document.messageId }),
      )
      .chain(message =>
        createBoundSelector(fullNameSelector, { id: message.personId }),
      )
      .buildSelector();

    reset();
    registerSelectors({
      personSelector,
      messageSelector,
      documentSelector,
      fullNameSelector,
      personByDocumentIdSelector,
    });

    const onCallButtonClick = () => {
      const personByDocumentId = personByDocumentIdSelector(commonState, {
        id: 111,
      });
      action('personByDocumentId')(personByDocumentId);
    };

    return <SelectorMonadGraph onCallButtonClick={onCallButtonClick} />;
  })
  .add('aggregation example', () => {
    const personsSelector = (state: State) => state.persons;

    const longestFullNameSelector = SelectorMonad.of(personsSelector)
      .chain(persons =>
        createSequenceSelector(
          Object.values(persons).map((person: Person) =>
            createBoundSelector(fullNameSelector, { id: person.id }),
          ),
        ),
      )
      .map(fullNames =>
        fullNames.reduce((longest, current) =>
          current.length > longest.length ? current : longest,
        ),
      )
      .buildSelector();

    reset();
    registerSelectors({
      personSelector,
      personsSelector,
      fullNameSelector,
      longestFullNameSelector,
    });

    const onCallButtonClick = () => {
      const longestFullName = longestFullNameSelector(commonState);
      action('longestFullName')(longestFullName);
    };

    return <SelectorMonadGraph onCallButtonClick={onCallButtonClick} />;
  })

  .add('switch dependency example', () => {
    const personOrMessageByDocumentIdSelector = SelectorMonad.of(
      documentSelector,
    )
      .chain(
        document =>
          (document.messageId === 100
            ? createBoundSelector(personSelector, { id: 1 })
            : createBoundSelector(messageSelector, {
                id: document.messageId,
              })) as Selector<State, Person | Message>,
      )
      .buildSelector();

    reset();
    registerSelectors({
      personSelector,
      messageSelector,
      documentSelector,
      personOrMessageByDocumentIdSelector,
    });

    const onCallButtonClick = () => {
      const longestFullName =
        Math.random() > 0.5
          ? personOrMessageByDocumentIdSelector(commonState, { id: 111 })
          : personOrMessageByDocumentIdSelector(commonState, { id: 222 });

      action('longestFullName')(longestFullName);
    };

    return <SelectorMonadGraph onCallButtonClick={onCallButtonClick} />;
  });
