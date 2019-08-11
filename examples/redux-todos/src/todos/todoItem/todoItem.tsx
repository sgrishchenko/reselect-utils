import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { reselectConnect } from 'reselect-utils';
import { TodoItemProps } from './todoItem.interface';
import { TodosAction } from '../todos.action';
import todoItemPropsSelector from './todoItem.selector';

const TodoItem: FunctionComponent<TodoItemProps> = ({
  todoId,
  todoName,
  todoCompleted,
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
          checked={todoCompleted}
          onChange={onCheckboxChange}
        />
      </div>
      <div style={{ flexGrow: 1 }}>{todoName}</div>
      <button type="button" onClick={onRemoveClick}>
        <span role="img" aria-label="Remove">
          ❌
        </span>
      </button>
    </div>
  );
};

export default connect(
  todoItemPropsSelector,
  {
    removeTodo: TodosAction.remove,
    completeTodo: TodosAction.complete,
  },
)(reselectConnect(todoItemPropsSelector)(TodoItem));
