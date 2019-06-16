import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
import { TodoItemOwnProps, TodoItemProps } from './todoItem.interface';
import { TodosStateSegment } from '../todos.interface';
import { TodosAction } from '../todos.action';

const TodoItem: FunctionComponent<TodoItemProps> = ({
  todoId,
  todo,
  removeTodo,
  completeTodo,
}) => {
  const onCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      completeTodo({ id: todoId, completed: event.target.checked });
    },
    [todoId, completeTodo],
  );

  const onRemoveClick = useCallback(() => {
    removeTodo({ id: todoId });
  }, [todoId, removeTodo]);

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onCheckboxChange}
        />
      </div>
      <div style={{ flexGrow: 1 }}>{todo.name}</div>
      <button type="button" onClick={onRemoveClick}>
        <span role="img" aria-label="Remove">
          ❌
        </span>
      </button>
    </div>
  );
};

export default connect(
  (state: TodosStateSegment, props: TodoItemOwnProps) => ({
    todo: state.todos[props.todoId],
  }),
  {
    removeTodo: TodosAction.remove,
    completeTodo: TodosAction.complete,
  },
)(TodoItem);
