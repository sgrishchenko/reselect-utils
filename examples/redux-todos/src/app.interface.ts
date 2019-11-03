import { TodosStateSegment } from './todos/todos.interface';
import { TodosViewStateSegment } from './todosView/todosView.interface';

export type State = TodosStateSegment & TodosViewStateSegment;
