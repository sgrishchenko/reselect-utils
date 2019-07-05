import createCachedSelector from 're-reselect';
import { commonState, State } from '../__data__/state';
import CounterObjectCache from '../CounterObjectCache';
import once from '../once';

jest.useFakeTimers();

describe('once', () => {
  const personSelector = (state: State, props: { id: number }) =>
    state.persons[props.id];

  const fullNameSelector = createCachedSelector(
    [personSelector],
    ({ firstName, secondName }) => `${firstName} ${secondName}`,
  )((state, props) => props.id, {
    cacheObject: new CounterObjectCache(),
  });

  test('should remove cached selector after using', () => {
    const actual = once(fullNameSelector)(commonState, { id: 1 });

    expect(actual).toBe('Marry Poppins');
    jest.runAllTimers();

    expect(
      fullNameSelector.getMatchingSelector(commonState, { id: 1 }),
    ).toBeUndefined();
  });
});
