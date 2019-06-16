import { ActionCreator } from 'typescript-fsa';
import { TodoFilter } from '../todosView.interface';

type TodoFilterSwitchStateProps = {
  todoFilter: TodoFilter;
};

export type TodoFilterSwitchDispatchProps = {
  setTodoFilter: ActionCreator<TodoFilter>;
};

export type TodoFilterSwitchProps = TodoFilterSwitchStateProps &
  TodoFilterSwitchDispatchProps;
