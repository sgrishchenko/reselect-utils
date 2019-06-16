import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import TodoItem from '../../todos/todoItem/todoItem';
import { TodoFilter, TodosViewStateSegment } from '../todosView.interface';
import { TodoListProps } from './todoList.interface';
import { Todo } from '../../todos/todos.interface';

const TodoList: FunctionComponent<TodoListProps> = ({ todos }) => {
  return (
    <>
      {todos.map(todo => (
        <TodoItem key={todo.id} todoId={todo.id} />
      ))}
    </>
  );
};

export default connect((state: TodosViewStateSegment) => {
  const allTodos = Object.values(state.todos);
  const todoFilter = state.todosView.filter;

  let todos: Todo[] = [];

  if (todoFilter === TodoFilter.COMPLETED) {
    todos = allTodos.filter(todo => todo.completed);
  } else if (todoFilter === TodoFilter.ACTIVE) {
    todos = allTodos.filter(todo => !todo.completed);
  } else if (todoFilter === TodoFilter.ALL) {
    todos = allTodos;
  }

  return {
    todos,
  };
})(TodoList);
