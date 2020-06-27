import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { TodoItem } from '../../todos/todoItem/todoItem';
import { todoListPropsSelector } from './todoList.selector';

export const TodoList: FunctionComponent = () => {
  const { todos } = useSelector(todoListPropsSelector);

  return (
    <>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todoId={todo.id} />
      ))}
    </>
  );
};
