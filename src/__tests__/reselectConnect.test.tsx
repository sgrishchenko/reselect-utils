import React, { FunctionComponent } from 'react';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import createCachedSelector, {
  OutputParametricCachedSelector,
} from 're-reselect';
import CounterObjectCache from '../CounterObjectCache';
import reselectConnect from '../reselectConnect';

jest.useFakeTimers();

describe('reselectConnect', () => {
  type State = {
    value: string;
  };

  type Props = {
    prop: string;
  };

  const commonState = { value: 'value' };

  const makeSelector = (removeDelay = 0) =>
    createCachedSelector(
      (state: State) => state.value,
      (state: State, props: Props) => props.prop,
      jest.fn(() => ({
        propFromSelector: 'prop2',
      })),
    )((state, props) => props.prop, {
      cacheObject: new CounterObjectCache({
        removeDelay,
      }),
    });

  const makeWrapper = (
    selector: ReturnType<
      OutputParametricCachedSelector<State, Props, any, any, any>
    >,
  ) => {
    const TestComponent: FunctionComponent<Props> = jest.fn(
      () => 'TestComponent Content',
    );
    TestComponent.displayName = 'TestComponent';

    const ConnectedTestComponent = connect(
      selector,
      {},
    )(reselectConnect(selector)(TestComponent));

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
    wrapper.unmount();
    jest.runAllTimers();

    selector(commonState, { prop: 'prop1' });

    expect(selector.resultFunc).toHaveBeenCalledTimes(2);
  });

  test('should reuse selector on fast remount', () => {
    const selector = makeSelector(100);
    const { wrapper } = makeWrapper(selector);
    wrapper.unmount();

    jest.advanceTimersByTime(50);
    wrapper.mount();

    selector(commonState, { prop: 'prop1' });

    expect(selector.resultFunc).toHaveBeenCalledTimes(1);
  });

  test('should clear cache after props changing', () => {
    const selector = makeSelector();
    const { wrapper, ConnectedTestComponent } = makeWrapper(selector);
    wrapper.setProps({
      children: <ConnectedTestComponent prop="prop2" />,
    });
    jest.runAllTimers();

    selector(commonState, { prop: 'prop1' });

    expect(selector.resultFunc).toHaveBeenCalledTimes(3);
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

    selector(commonState, { prop: 'prop1' });

    expect(selector.resultFunc).toHaveBeenCalledTimes(2);
  });
});
