import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import TodoItem from '../../todos/todoItem/todoItem';
import { TodoListProps } from './todoList.interface';
import todoListPropsSelector from './todoList.selector';

const TodoList: FunctionComponent<TodoListProps> = ({ todos }) => {
  return (
    <>
      {todos.map(todo => (
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        <TodoItem key={todo.id} todoId={todo.id} />
      ))}
    </>
  );
};

export default connect(todoListPropsSelector)(TodoList);
