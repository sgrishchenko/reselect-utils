import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { TodoItem } from '../../todos/todoItem/todoItem';
import { TodoListProps } from './todoList.interface';
import { todoListPropsSelector } from './todoList.selector';

export const TodoList: FunctionComponent<TodoListProps> = () => {
  const { todos } = useSelector(todoListPropsSelector);

  return (
    <>
      {todos.map(todo => (
        <TodoItem key={todo.id} todoId={todo.id} />
      ))}
    </>
  );
};
