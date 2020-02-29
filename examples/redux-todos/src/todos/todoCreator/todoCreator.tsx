import React, {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { TodoCreatorProps } from './todoCreator.interface';
import { TodosAction } from '../todos.action';

export const TodoCreator: FunctionComponent<TodoCreatorProps> = () => {
  const [todoName, setTodoName] = useState('');
  const dispatch = useDispatch();

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTodoName(event.target.value);
    },
    [setTodoName],
  );

  const onAddClick = useCallback(() => {
    const payload = { name: todoName.trim() ? todoName.trim() : undefined };
    dispatch(TodosAction.add(payload));
    setTodoName('');
  }, [dispatch, todoName, setTodoName]);

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
