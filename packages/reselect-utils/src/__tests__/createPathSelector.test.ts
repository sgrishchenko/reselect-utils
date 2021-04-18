import { createCachedSelector } from 're-reselect';
import { createPathSelector } from '../createPathSelector';
import { commonState, State, Document } from '../__data__/state';
import { isCachedSelector } from '../helpers';

describe('createPathSelector', () => {
  test('should implement basic access to state properties', () => {
    const baseSelector = (state: Partial<State>) => state;
    const pathSelector = createPathSelector(baseSelector);

    const baseParametricSelector = (
      state: State,
      props: { id: number },
    ): Document | undefined => state.documents[props.id];
    const pathParametricSelector = createPathSelector(baseParametricSelector);

    expect(pathSelector.messages[100].text()(commonState)).toEqual('Hello');
    expect(pathSelector.messages[300].text()(commonState)).toBeUndefined();
    expect(pathSelector.messages[300].text('Default')(commonState)).toBe(
      'Default',
    );

    expect(
      pathParametricSelector.messageId()(commonState, { id: 111 }),
    ).toEqual(100);
    expect(pathParametricSelector.data[0]()(commonState, { id: 111 })).toEqual(
      1,
    );
    expect(
      pathParametricSelector.messageId()(commonState, { id: 333 }),
    ).toBeUndefined();
    expect(
      pathParametricSelector.messageId(100500)(commonState, { id: 333 }),
    ).toBe(100500);
  });

  test('should handle states typed as interface', () => {
    interface IState {
      name: string;
    }

    const baseSelector = (state: IState) => state;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    createPathSelector(baseSelector).name('');

    const nameSelector = createPathSelector(baseSelector).name();

    expect(nameSelector({ name: 'name' })).toBe('name');
  });

  describe('integration with re-reselect', () => {
    test('should expose keySelector if base selector is cached', () => {
      const personSelector = createCachedSelector(
        [
          (state: State) => state.persons,
          (state: State, props: { personId: number }) => props.personId,
        ],
        (persons, personId) => persons[personId],
      )({
        keySelector: (state: State, props: { personId: number }) =>
          props.personId,
      });

      const firstNameSelector = createPathSelector(personSelector).firstName();

      if (!isCachedSelector(firstNameSelector)) {
        throw new Error('firstNameSelector should be cached');
      }

      const personId = 1;
      const key = firstNameSelector.keySelector(expect.anything(), {
        personId,
      }) as unknown;

      expect(key).toBe(personId);
    });
  });
});
