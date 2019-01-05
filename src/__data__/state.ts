// @ts-ignore
import {getStateWith} from 'reselect-tools';

export type Person = {
    id: number,
    firstName: string,
    secondName: string,
}

export type Message = {
    id: number,
    personId: number,
    date: Date,
    text: string,
}

export type State = {
    persons: {
        [id: number]: Person
    },
    messages: {
        [id: number]: Message
    }
}

export const state: State = {
    persons: {
        1: {
            id: 1,
            firstName: 'Marry',
            secondName: 'Poppins',
        },
        2: {
            id: 2,
            firstName: 'Harry',
            secondName: 'Potter',
        }
    },

    messages: {
        100: {
            id: 100,
            personId: 1,
            date: new Date('2018-12-29'),
            text: 'Hello',
        },
        200: {
            id: 200,
            personId: 2,
            date: new Date('2018-12-30'),
            text: 'Buy',
        }
    }
};

getStateWith(() => ({...state}));
