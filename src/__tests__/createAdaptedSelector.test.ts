import {Message, Person, state, State} from "../__data__/state";
import {createStructuredSelector} from "reselect";
import {createAdaptedSelector} from "../createAdaptedSelector";

describe('createAdaptedSelector', () => {
    const getPerson = (state: State, props: { id: number }) => state.persons[props.id];
    const getMessage = (state: State, props: { id: number }) => state.messages[props.id];

    const adaptedGetPerson = createAdaptedSelector(
        getPerson,
        (props: {personId: number}) => ({id: props.personId})
    );
    const adaptedGetMessage = createAdaptedSelector(
        getMessage,
        (props: {messageId: number}) => ({id: props.messageId})
    );

    type PersonAndMessageProps = {
        personId: number,
        messageId: number
    }

    type PersonAndMessage = {
        person: Person,
        message: Message
    }

    const getPersonAndMessage = createStructuredSelector<State, PersonAndMessageProps, PersonAndMessage>({
        person: adaptedGetPerson,
        message: adaptedGetMessage,
    });

    test('should implement adaptation of selector by mapping function', () => {
        const actual = getPersonAndMessage(state, {
            personId: 1,
            messageId: 100,
        });

        expect(actual.person.firstName).toBe('Marry');
        expect(actual.message.text).toBe('Hello');
    });

    test('should implement adaptation of selector by binding to partial props', () => {
        const getMarryAndMessage = createAdaptedSelector(getPersonAndMessage, {
            personId: 1,
        });

        const marryAndMessage = getMarryAndMessage(state, {
            messageId: 100,
        });

        expect(marryAndMessage.person.firstName).toBe('Marry');
        expect(marryAndMessage.message.text).toBe('Hello');

        const getPersonAndHello = createAdaptedSelector(getPersonAndMessage, {
            messageId: 100,
        });

        const personAndHello = getPersonAndHello(state, {
            personId: 1
        });

        expect(personAndHello.person.firstName).toBe('Marry');
        expect(personAndHello.message.text).toBe('Hello');
    });

    test('should implement adaptation of selector by binding to full props', () => {
        const getMarryAndHello = createAdaptedSelector(getPersonAndMessage, {
            personId: 1,
            messageId: 100,
        });

        const marryAndHello = getMarryAndHello(state);

        expect(marryAndHello.person.firstName).toBe('Marry');
        expect(marryAndHello.message.text).toBe('Hello');
    })
});
