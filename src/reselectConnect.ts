import { ComponentType, createElement, Component, ComponentClass } from 'react';
import { connect } from 'react-redux';
import CounterObjectCache from './CounterObjectCache';
import { ParametricSelector, Selector } from './types';

export default <S, P, R>(
  selector: Selector<S, R> | ParametricSelector<S, P, R>,
) => <C extends ComponentType<P>>(
  WrappedComponent: C,
): ComponentClass<JSX.LibraryManagedAttributes<C, P>> => {
  const wrappedComponentName =
    WrappedComponent.displayName ||
    /* istanbul ignore next */ WrappedComponent.name ||
    /* istanbul ignore next */ 'Component';

  const addRef = CounterObjectCache.addRefRecursively(selector);
  const removeRef = CounterObjectCache.removeRefRecursively(selector);
  const state = Symbol('state');

  class Wrapper extends Component<P & { [state]: S }> {
    public static displayName = `ReselectConnect(${wrappedComponentName})`;

    public componentDidMount() {
      /* eslint-disable-next-line react/destructuring-assignment */
      addRef(this.props[state], this.props);
    }

    public componentDidUpdate(prevProps: P & { [state]: S }) {
      removeRef(prevProps[state], prevProps);
      /* eslint-disable-next-line react/destructuring-assignment */
      addRef(this.props[state], this.props);
    }

    public componentWillUnmount() {
      /* eslint-disable-next-line react/destructuring-assignment */
      removeRef(this.props[state], this.props);
    }

    public render() {
      return createElement(WrappedComponent, this.props);
    }
  }

  return connect(
    reduxState => ({ [state]: reduxState }),
    {},
    undefined,
    { getDisplayName: name => `InnerConnect(${name})` },
    // @ts-ignore because something wrong with type Matching in react-redux typing
  )(Wrapper);
};
