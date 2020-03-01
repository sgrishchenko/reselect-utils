import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { v1 as uuidv1 } from 'uuid';
import { TodosAction } from './todos.action';
import { TodosState } from './todos.interface';

export const todosInitialState: TodosState = {};

export const todosReducer = reducerWithInitialState(todosInitialState)
  .case(TodosAction.add, (state, { name }) => {
    const todoId = uuidv1();
    return {
      ...state,
      [todoId]: {
        id: todoId,
        name,
        completed: false,
      },
    };
  })
  .case(TodosAction.remove, (state, { id }) =>
    Object.entries(state)
      .filter(([key]) => id !== key)
      .reduce(
        (result, [key, item]) => ({
          ...result,
          [key]: item,
        }),
        {},
      ),
  )
  .case(TodosAction.complete, (state, { id, completed }) => ({
    ...state,
    [id]: {
      ...state[id],
      completed,
    },
  }));
