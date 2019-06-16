import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useState,
} from 'react';
import { connect } from 'react-redux';
import { TodoCreatorProps } from './todoCreator.interface';
import { TodosAction } from '../todos.action';

const TodoCreator: FunctionComponent<TodoCreatorProps> = ({ addTodo }) => {
  const [todoName, setTodoName] = useState('');

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTodoName(event.target.value);
    },
    [setTodoName],
  );

  const onAddClick = useCallback(() => {
    addTodo({ name: todoName.trim() });
    setTodoName('');
  }, [todoName, setTodoName]);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <input
          placeholder="Enter new Todo name..."
          value={todoName}
          onChange={onInputChange}
        />
      </div>
      <button type="button" disabled={!todoName.trim()} onClick={onAddClick}>
        Add
      </button>
    </div>
  );
};

export default connect(
  null,
  {
    addTodo: TodosAction.add,
  },
)(TodoCreator);
