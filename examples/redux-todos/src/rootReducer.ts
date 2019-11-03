import { combineReducers } from 'redux';
import { State } from './app.interface';
import { todosReducer } from './todos/todos.reducer';
import { todosViewReducer } from './todosView/todosView.reducer';

export const rootReducer = combineReducers<State>({
  todos: todosReducer,
  todosView: todosViewReducer,
});
