import React, { ChangeEvent, FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TodoFilterSwitchProps } from './todoFilterSwitch.interface';
import { TodoFilter } from '../todosView.interface';
import { TodosViewAction } from '../todosView.action';
import { todoFilterSwitchPropsSelector } from './todoFilterSwitch.selector';

export const TodoFilterSwitch: FunctionComponent<
  TodoFilterSwitchProps
> = () => {
  const { todoFilter } = useSelector(todoFilterSwitchPropsSelector);
  const dispatch = useDispatch();

  const onRadioChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const payload = event.target.value as TodoFilter;
      dispatch(TodosViewAction.setFilter(payload));
    },
    [dispatch],
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
