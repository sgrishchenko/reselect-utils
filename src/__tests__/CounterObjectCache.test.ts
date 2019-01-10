import createCachedSelector from "re-reselect";
import CounterObjectCache from "../CounterObjectCache";

jest.useFakeTimers();

describe('CounterObjectCache', () => {
    type State = {
        value: string
    }

    type Props = {
        prop: string
    }

    const makeSelector = (removeDelay = 0) => createCachedSelector(
        (state: State) => state.value,
        (state: State, props: Props) => props.prop,
        jest.fn(),
    )((state, props) => props.prop, {
        cacheObject: new CounterObjectCache({
            removeDelay,
        })
    });

    test('should cause only two recomputations', () => {
        const selector = makeSelector();
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        selector(state, {prop: 'prop2'});
        selector(state, {prop: 'prop1'});
        selector(state, {prop: 'prop2'});

        expect(selector.resultFunc).toHaveBeenCalledTimes(2)
    });

    test('should remove cache item after removeMatchingSelector call', () => {
        const selector = makeSelector();
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});
        jest.runAllTimers();

        selector(state, {prop: 'prop1'});

        expect(selector.resultFunc).toHaveBeenCalledTimes(2)
    });

    test('should not remove cache item if after removeMatchingSelector call references exists', () => {
        const selector = makeSelector();
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        selector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});
        jest.runAllTimers();

        selector(state, {prop: 'prop1'});

        expect(selector.resultFunc).toHaveBeenCalledTimes(1)
    });

    test('should remove cache item if after removeMatchingSelector call references not exists', () => {
        const selector = makeSelector();
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        selector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});
        jest.runAllTimers();

        selector(state, {prop: 'prop1'});

        expect(selector.resultFunc).toHaveBeenCalledTimes(2)
    });

    test('should remove cache item only after delay', () => {
        const selector = makeSelector(100);
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});

        jest.advanceTimersByTime(50);
        selector(state, {prop: 'prop1'});
        selector.removeMatchingSelector(state, {prop: 'prop1'});
        expect(selector.resultFunc).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        selector(state, {prop: 'prop1'});
        expect(selector.resultFunc).toHaveBeenCalledTimes(2)
    });

    test('should implement cache cleaning', () => {
        const selector = makeSelector();
        const state = {value: 'value'};

        selector(state, {prop: 'prop1'});
        expect(selector.getMatchingSelector(state, {prop: 'prop1'})).toBeDefined();

        selector.clearCache();
        jest.runAllTimers();

        expect(selector.getMatchingSelector(state, {prop: 'prop1'})).toBeUndefined();
    })
});
