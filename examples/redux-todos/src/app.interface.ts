import { TodosStateSegment } from './todos/todos.interface';
import { TodosViewStateSegment } from './todosView/todosView.interface';

/* eslint-disable-next-line import/prefer-default-export */
export type State = TodosStateSegment & TodosViewStateSegment;
