import createCachedSelector from 're-reselect';
import CounterObjectCache, {
  CounterObjectCacheOptions,
} from '../CounterObjectCache';
import { commonState, State } from '../__data__/state';

jest.useFakeTimers();

describe('CounterObjectCache', () => {
  const makeSelectors = ({
    removeDelay = 0,
    warnAboutUncontrolled = false,
  }: CounterObjectCacheOptions = {}) => {
    const personSelector = createCachedSelector(
      [
        (state: State) => state.persons,
        (state: State, props: { id: number }) => props.id,
      ],
      (persons, id) => persons[id],
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache({
        removeDelay,
        warnAboutUncontrolled,
      }),
    });

    const fullNameSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache({
        removeDelay,
        warnAboutUncontrolled,
      }),
    });

    return {
      personSelector,
      fullNameSelector,
    };
  };

  describe('basic functionality', () => {
    test('should cause only two recomputations', () => {
      const { personSelector } = makeSelectors();

      personSelector(commonState, { id: 1 });
      personSelector(commonState, { id: 2 });
      personSelector(commonState, { id: 1 });
      personSelector(commonState, { id: 2 });

      expect(personSelector.recomputations()).toBe(2);
    });

    test('should implement cache cleaning', () => {
      const { personSelector } = makeSelectors();

      personSelector(commonState, { id: 1 });
      personSelector(commonState, { id: 2 });

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();
      expect(
        personSelector.getMatchingSelector(commonState, { id: 2 }),
      ).toBeDefined();

      personSelector.clearCache();
      jest.runAllTimers();

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
      expect(
        personSelector.getMatchingSelector(commonState, { id: 2 }),
      ).toBeUndefined();
    });
  });

  describe('auto-clean with no refs', () => {
    test('should remove cache item after removeRefRecursively call', () => {
      const { personSelector } = makeSelectors();

      personSelector(commonState, { id: 1 });
      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });

    test('should not remove cache item if after removeRefRecursively call references exists', () => {
      const { personSelector } = makeSelectors();

      personSelector(commonState, { id: 1 });
      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();
    });

    test('should remove cache item if references added and removed multiply times', () => {
      const { personSelector } = makeSelectors();

      personSelector(commonState, { id: 1 });
      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });

    test('should remove cache item only after delay', () => {
      const { personSelector } = makeSelectors({ removeDelay: 100 });

      personSelector(commonState, { id: 1 });
      CounterObjectCache.addRefRecursively(personSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(personSelector)(commonState, {
        id: 1,
      });

      jest.advanceTimersByTime(50);
      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      jest.runAllTimers();
      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });

    test('should remove cache items for dependencies', () => {
      const { personSelector, fullNameSelector } = makeSelectors({
        removeDelay: 100,
      });

      fullNameSelector(commonState, { id: 1 });

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();
      expect(
        fullNameSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.addRefRecursively(fullNameSelector)(commonState, {
        id: 1,
      });
      CounterObjectCache.removeRefRecursively(fullNameSelector)(commonState, {
        id: 1,
      });
      jest.runAllTimers();

      expect(
        personSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
      expect(
        fullNameSelector.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });
  });

  describe('warning about uncontrolled cache object life cycle', () => {
    const consoleSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    afterEach(() => {
      consoleSpy.mockClear();
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    test('should print warning to console if after selector call no confirmation', () => {
      const { personSelector } = makeSelectors({ warnAboutUncontrolled: true });

      personSelector(commonState, { id: 1 });
      jest.runAllTimers();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    test('should not print warning to console if after selector call was confirmation', () => {
      const { personSelector } = makeSelectors({ warnAboutUncontrolled: true });

      personSelector(commonState, { id: 1 });
      CounterObjectCache.confirmValidAccessRecursively(personSelector)(
        commonState,
        { id: 1 },
      );
      jest.runAllTimers();

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should print warning to console about dependent selectors too', () => {
      const { fullNameSelector } = makeSelectors({
        warnAboutUncontrolled: true,
      });

      fullNameSelector(commonState, { id: 1 });
      jest.runAllTimers();

      // for fullNameSelector and personSelector
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    test('should print warning to console if confirmed only dependent selector call', () => {
      const { personSelector, fullNameSelector } = makeSelectors({
        warnAboutUncontrolled: true,
      });

      fullNameSelector(commonState, { id: 1 });

      // confirm only personSelector
      CounterObjectCache.confirmValidAccessRecursively(personSelector)(
        commonState,
        { id: 1 },
      );
      jest.runAllTimers();

      // only for fullNameSelector
      // because personSelector was confirmed
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });
});
