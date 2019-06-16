import React, { FunctionComponent } from 'react';
import TodoFilterSwitch from './todoFilterSwitch/todoFilterSwitch';
import TodoList from './todoList/todoList';
import TodoCreator from '../todos/todoCreator/todoCreator';

const TodosView: FunctionComponent = () => {
  return (
    <div style={{ width: '300px' }}>
      <h3>Todos</h3>
      <TodoCreator />
      <TodoList />
      <TodoFilterSwitch />
    </div>
  );
};

export default TodosView;
