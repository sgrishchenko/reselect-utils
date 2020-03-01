import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { TodoItemProps } from './todoItem.interface';
import { TodosAction } from '../todos.action';
import { todoItemPropsSelector } from './todoItem.selector';
import { useParametricSelector } from '../../utils/hooks';

export const TodoItem: FunctionComponent<TodoItemProps> = ({ todoId }) => {
  const {
    todoName,
    todoCompleted,
  } = useParametricSelector(todoItemPropsSelector, { todoId });
  const dispatch = useDispatch();

  const onCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const payload = { id: todoId, completed: event.target.checked };
      dispatch(TodosAction.complete(payload));
    },
    [dispatch, todoId],
  );

  const onRemoveClick = useCallback(() => {
    const payload = { id: todoId };
    dispatch(TodosAction.remove(payload));
  }, [dispatch, todoId]);

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
