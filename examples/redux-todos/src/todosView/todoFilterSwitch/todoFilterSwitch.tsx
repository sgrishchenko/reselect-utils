import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
import { TodoFilterSwitchProps } from './todoFilterSwitch.interface';
import { TodoFilter } from '../todosView.interface';
import { TodosViewAction } from '../todosView.action';
import todoFilterSwitchPropsSelector from './todoFilterSwitch.selector';

const TodoFilterSwitch: FunctionComponent<TodoFilterSwitchProps> = ({
  todoFilter,
  setTodoFilter,
}) => {
  const onRadioChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTodoFilter(event.target.value as TodoFilter);
    },
    [setTodoFilter],
  );

  return (
    <div>
      <label>
        <input
          type="radio"
          value={TodoFilter.ALL}
          checked={todoFilter === TodoFilter.ALL}
          onChange={onRadioChange}
        />
        All
      </label>
      <label>
        <input
          type="radio"
          value={TodoFilter.ACTIVE}
          checked={todoFilter === TodoFilter.ACTIVE}
          onChange={onRadioChange}
        />
        Active
      </label>
      <label>
        <input
          type="radio"
          value={TodoFilter.COMPLETED}
          checked={todoFilter === TodoFilter.COMPLETED}
          onChange={onRadioChange}
        />
        Completed
      </label>
    </div>
  );
};

export default connect(
  todoFilterSwitchPropsSelector,
  {
    setTodoFilter: TodosViewAction.setFilter,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
)(TodoFilterSwitch);
