import React, { FunctionComponent } from 'react';
import { mount } from 'enzyme';
import { AnyAction, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import createCachedSelector from 're-reselect';
import CounterObjectCache, {
  CounterObjectCacheOptions,
} from '../CounterObjectCache';
import reselectConnect from '../reselectConnect';
import { ParametricSelector, Selector } from '../types';

jest.useFakeTimers();

describe('reselectConnect', () => {
  type State = {
    value: string;
  };

  type Props = {
    prop: string;
  };

  const commonState = { value: 'value' };

  const makeSelector = ({
    removeDelay = 0,
    warnAboutUncontrolled = false,
  }: CounterObjectCacheOptions = {}) =>
    createCachedSelector(
      (state: State) => state.value,
      (state: State, props: Props) => props.prop,
      jest.fn(() => ({
        propFromSelector: 'prop2',
      })),
    )((state, props) => props.prop, {
      cacheObject: new CounterObjectCache({
        removeDelay,
        warnAboutUncontrolled,
      }),
    });

  const makeWrapper = (
    selector: Selector<State, any> | ParametricSelector<State, Props, any>,
    updateRefsOnStateChange?: boolean,
  ) => {
    const TestComponent: FunctionComponent<Props> = jest.fn(() => (
      <>TestComponent Content</>
    ));
    TestComponent.displayName = 'TestComponent';

    const ConnectedTestComponent = connect(
      selector,
      {},
    )(
      reselectConnect(selector, {
        updateRefsOnStateChange,
      })(TestComponent),
    );

    const store = createStore(() => ({ ...commonState }));

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedTestComponent prop="prop1" />
      </Provider>,
    );

    return {
      TestComponent,
      ConnectedTestComponent,
      store,
      wrapper,
    };
  };

  test('should proxy all props and renders wrapped component', () => {
    const selector = makeSelector();
    const { wrapper } = makeWrapper(selector);

    expect(wrapper).toMatchSnapshot();
  });

  test('should create instance of selector and reuse it in another usages', () => {
    const selector = makeSelector();

    // first call on mount
    makeWrapper(selector);

    // second call here
    selector(commonState, { prop: 'prop1' });

    expect(selector.resultFunc).toHaveBeenCalledTimes(1);
  });

  test('should clear cache after component unmount', () => {
    const selector = makeSelector();
    const { wrapper } = makeWrapper(selector);

    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeDefined();

    wrapper.unmount();
    jest.runAllTimers();

    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeUndefined();
  });

  test('should reuse selector on fast remount', () => {
    const selector = makeSelector({ removeDelay: 100 });
    const { wrapper } = makeWrapper(selector);
    wrapper.unmount();

    jest.advanceTimersByTime(50);
    wrapper.mount();

    expect(selector.resultFunc).toHaveBeenCalledTimes(1);
  });

  test('should clear cache after props changing', () => {
    const selector = makeSelector();
    const { wrapper, ConnectedTestComponent } = makeWrapper(selector);

    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeDefined();

    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop2" />,
    });
    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeDefined();
    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop2' }),
    ).toBeDefined();

    jest.runAllTimers();

    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop2' }),
    ).toBeDefined();
    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeUndefined();
  });

  test('should not accumulate ref count on parent re-renders', () => {
    const selector = makeSelector();
    const { wrapper, ConnectedTestComponent, store } = makeWrapper(selector);

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    wrapper.unmount();
    jest.runAllTimers();

    expect(
      selector.getMatchingSelector(commonState, { prop: 'prop1' }),
    ).toBeUndefined();
  });

  test('should not re-render component if props shallow equal even if state updated', () => {
    const selector = makeSelector();
    const {
      wrapper,
      ConnectedTestComponent,
      TestComponent,
      store,
    } = makeWrapper(selector);

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    jest.runAllTimers();

    expect(TestComponent).toHaveBeenCalledTimes(1);
  });

  test('should not re-render component if props shallow equal and state strict equal (updateRefsOnStateChange is true)', () => {
    const selector = makeSelector();
    const updateRefsOnStateChange = true;
    const { wrapper, ConnectedTestComponent, TestComponent } = makeWrapper(
      selector,
      updateRefsOnStateChange,
    );

    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    jest.runAllTimers();

    expect(TestComponent).toHaveBeenCalledTimes(1);
  });

  test('should re-render component if props shallow equal and state updated (updateRefsOnStateChange is true)', () => {
    const selector = makeSelector();
    const updateRefsOnStateChange = true;
    const {
      wrapper,
      ConnectedTestComponent,
      TestComponent,
      store,
    } = makeWrapper(selector, updateRefsOnStateChange);

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    // force update root of store
    store.dispatch({ type: 'ANY_ACTION' });
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop1" />,
    });

    jest.runAllTimers();

    expect(TestComponent).toHaveBeenCalledTimes(3);
  });

  test('should update ref count if state used in key selector', () => {
    type ExoticState = {
      data: number[];
      indexesForSelection: [number, number];
    };

    const initialState: ExoticState = {
      data: [1, 2, 2, 3],
      indexesForSelection: [0, 3],
    };

    const updateIndexesForSelection = (
      indexesForSelection: [number, number],
    ) => ({
      type: 'UPDATE_INDEXES_FOR_SELECTION',
      indexesForSelection,
    });

    const reducer = (state = initialState, action: AnyAction) => {
      if (action.type === 'UPDATE_INDEXES_FOR_SELECTION') {
        return {
          ...state,
          indexesForSelection: action.indexesForSelection,
        };
      }

      return state;
    };

    const store = createStore(reducer);

    const selector = createCachedSelector(
      (state: ExoticState) => state.data,
      (state: ExoticState) => state.indexesForSelection,
      (data, [first, second]) => ({
        result: data[first] + data[second],
      }),
    )(
      state => {
        const [first, second] = state.indexesForSelection;
        return `${first}:${second}`;
      },
      {
        cacheObject: new CounterObjectCache(),
      },
    );

    const TestComponent: FunctionComponent = jest.fn(() => (
      <>TestComponent Content</>
    ));

    const ConnectedTestComponent = connect(
      selector,
      {},
    )(
      reselectConnect(selector, {
        updateRefsOnStateChange: true,
      })(TestComponent),
    );

    mount(
      <Provider store={store}>
        <ConnectedTestComponent />
      </Provider>,
    );

    const prevState = store.getState();
    store.dispatch(updateIndexesForSelection([1, 2]));

    jest.runAllTimers();

    expect(selector.getMatchingSelector(store.getState())).toBeDefined();
    expect(selector.getMatchingSelector(prevState)).toBeUndefined();
  });
});
