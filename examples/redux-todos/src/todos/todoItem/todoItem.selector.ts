import createCachedSelector from 're-reselect';
import {
  createPathSelector,
  createPropSelector,
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  CounterObjectCache,
  // eslint-disable-next-line import/no-unresolved
} from 'reselect-utils';
import { todoSelector } from '../todos.selector';
import { TodoItemOwnProps } from './todoItem.interface';

export default createCachedSelector(
  [
    createPathSelector(todoSelector).name('To do something...'),
    createPathSelector(todoSelector).completed(false),
  ],
  (todoName, todoCompleted) => ({
    todoName,
    todoCompleted,
  }),
)(createPropSelector<TodoItemOwnProps>().todoId(), {
  cacheObject: new CounterObjectCache(),
});
