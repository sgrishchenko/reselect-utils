import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {createStructuredSelector} from 'reselect';
import SelectorGraph from './SelectorGraph';
// @ts-ignore
import {selectorGraph, registerSelectors, reset} from 'reselect-tools';
import {Message, Person, State} from "../__data__/state";
import {createAdaptedSelector} from "../createAdaptedSelector";

const getPerson = (state: State, props: { id: number }) => state.persons[props.id];
const getMessage = (state: State, props: { id: number }) => state.messages[props.id];

type PersonAndMessageProps = {
    personId: number,
    messageId: number
}

type PersonAndMessage = {
    person: Person,
    message: Message
}

storiesOf('createAdaptedSelector', module)
    .add('mapping example', () => {
        const getPersonAndMessage = createStructuredSelector<State, PersonAndMessageProps, PersonAndMessage>({
            person: createAdaptedSelector(
                getPerson,
                (props: {personId: number}) => ({id: props.personId})
            ),
            message: createAdaptedSelector(
                getMessage,
                (props: {messageId: number}) => ({id: props.messageId})
            ),
        });

        reset();
        registerSelectors({
            getPerson,
            getMessage,
            getPersonAndMessage,
        });

        const {nodes, edges} = selectorGraph();
        return (
            <SelectorGraph
                nodes={nodes}
                edges={edges}
                onNodeClick={(name, node) => action(name)(node)}
            />
        );
    })
    .add('binding example', () => {
        const getMarryAndHello = createStructuredSelector<State, PersonAndMessage>({
            person: createAdaptedSelector(getPerson, {id: 1}),
            message: createAdaptedSelector(getMessage, {id: 100}),
        });

        reset();
        registerSelectors({
            getPerson,
            getMessage,
            getMarryAndHello,
        });

        const {nodes, edges} = selectorGraph();
        return (
            <SelectorGraph
                nodes={nodes}
                edges={edges}
                onNodeClick={(name, node) => action(name)(node)}
            />
        );
    });
