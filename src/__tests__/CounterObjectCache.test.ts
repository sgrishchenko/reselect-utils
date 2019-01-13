import createCachedSelector from 're-reselect';
import CounterObjectCache from '../CounterObjectCache';
import { commonState, State } from '../__data__/state';

jest.useFakeTimers();

describe('CounterObjectCache', () => {
  describe('instance', () => {
    type State = {
      value: string;
    };

    type Props = {
      prop: string;
    };

    const makeSelector = (removeDelay = 0) =>
      createCachedSelector(
        (state: State) => state.value,
        (state: State, props: Props) => props.prop,
        jest.fn(),
      )((state, props) => props.prop, {
        cacheObject: new CounterObjectCache({
          removeDelay,
        }),
      });

    test('should cause only two recomputations', () => {
      const selector = makeSelector();
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      selector(state, { prop: 'prop2' });
      selector(state, { prop: 'prop1' });
      selector(state, { prop: 'prop2' });

      expect(selector.resultFunc).toHaveBeenCalledTimes(2);
    });

    test('should remove cache item after removeRefRecursively call', () => {
      const selector = makeSelector();
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.removeRefRecursively(selector)(state, {
        prop: 'prop1',
      });
      jest.runAllTimers();

      selector(state, { prop: 'prop1' });

      expect(selector.resultFunc).toHaveBeenCalledTimes(2);
    });

    test('should not remove cache item if after removeRefRecursively call references exists', () => {
      const selector = makeSelector();
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.removeRefRecursively(selector)(state, {
        prop: 'prop1',
      });
      jest.runAllTimers();

      selector(state, { prop: 'prop1' });

      expect(selector.resultFunc).toHaveBeenCalledTimes(1);
    });

    test('should remove cache item if after removeMatchingSelector call references not exists', () => {
      const selector = makeSelector();
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.removeRefRecursively(selector)(state, {
        prop: 'prop1',
      });
      CounterObjectCache.removeRefRecursively(selector)(state, {
        prop: 'prop1',
      });
      jest.runAllTimers();

      selector(state, { prop: 'prop1' });

      expect(selector.resultFunc).toHaveBeenCalledTimes(2);
    });

    test('should remove cache item only after delay', () => {
      const selector = makeSelector(100);
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      CounterObjectCache.addRefRecursively(selector)(state, { prop: 'prop1' });
      CounterObjectCache.removeRefRecursively(selector)(state, {
        prop: 'prop1',
      });

      jest.advanceTimersByTime(50);
      selector(state, { prop: 'prop1' });
      expect(selector.resultFunc).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      selector(state, { prop: 'prop1' });
      expect(selector.resultFunc).toHaveBeenCalledTimes(2);
    });

    test('should implement cache cleaning', () => {
      const selector = makeSelector();
      const state = { value: 'value' };

      selector(state, { prop: 'prop1' });
      expect(
        selector.getMatchingSelector(state, { prop: 'prop1' }),
      ).toBeDefined();

      selector.clearCache();
      jest.runAllTimers();

      expect(
        selector.getMatchingSelector(state, { prop: 'prop1' }),
      ).toBeUndefined();
    });
  });

  describe('static', () => {
    const getPerson = createCachedSelector(
      [
        (state: State) => state.persons,
        (state: State, props: { id: number }) => props.id,
      ],
      (persons, id) => persons[id],
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache(),
    });

    const getFullName = createCachedSelector(
      [getPerson],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache(),
    });

    afterEach(() => {
      getPerson.clearCache();
      getFullName.clearCache();
    });

    test('should remove cached selector', () => {
      getFullName(commonState, { id: 1 });

      expect(
        getFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(getFullName)(commonState, { id: 1 });
      CounterObjectCache.removeRefRecursively(getFullName)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        getFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });

    test('should remove cached selector for dependencies', () => {
      getFullName(commonState, { id: 1 });

      expect(
        getPerson.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();
      expect(
        getFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(getFullName)(commonState, { id: 1 });
      CounterObjectCache.removeRefRecursively(getFullName)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        getPerson.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
      expect(
        getFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });
  });
});
