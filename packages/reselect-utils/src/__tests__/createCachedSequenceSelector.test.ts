import { createCachedSequenceSelector } from '../createCachedSequenceSelector';
import { State, commonState } from '../__data__/state';

describe('createCachedSequenceSelector', () => {
  const personSelector = (state: State, props: { personId: number }) =>
    state.persons[props.personId];

  test('should cache result for different props', () => {
    const selector = createCachedSequenceSelector([
      personSelector,
      personSelector,
    ])({
      keySelector: (state, props) => props.personId,
    });

    const result1 = selector(commonState, { personId: 1 });
    const result2 = selector(commonState, { personId: 2 });
    const result3 = selector(commonState, { personId: 1 });
    const result4 = selector(commonState, { personId: 2 });

    expect(result1.map((person) => person.firstName)).toEqual([
      'Marry',
      'Marry',
    ]);
    expect(result2.map((person) => person.firstName)).toEqual([
      'Harry',
      'Harry',
    ]);

    expect(result1).toBe(result3);
    expect(result2).toBe(result4);
  });
});
