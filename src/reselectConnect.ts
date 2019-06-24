import { ComponentType, createElement, Component, ComponentClass } from 'react';
import { connect } from 'react-redux';
import CounterObjectCache from './CounterObjectCache';
import { ParametricSelector, Selector } from './types';

export type ReselectConnectedComponent<
  C extends ComponentType<any>,
  P
> = C extends ComponentType<infer CP>
  ? CP extends P
    ? ComponentClass<JSX.LibraryManagedAttributes<C, CP>>
    : never
  : never;

export default <S, P, R>(
  selector: Selector<S, R> | ParametricSelector<S, P, R>,
) => <C extends ComponentType<any>>(WrappedComponent: C) => {
  const wrappedComponentName =
    WrappedComponent.displayName ||
    /* istanbul ignore next */ WrappedComponent.name ||
    /* istanbul ignore next */ 'Component';

  const addRef = CounterObjectCache.addRefRecursively(selector);
  const removeRef = CounterObjectCache.removeRefRecursively(selector);
  const state = Symbol('state');

  type WrapperProps = P & { [state]: S };

  class Wrapper extends Component<WrapperProps> {
    public static displayName = `ReselectConnect(${wrappedComponentName})`;

    public componentDidMount() {
      /* eslint-disable-next-line react/destructuring-assignment */
      addRef(this.props[state], this.props);
    }

    public componentDidUpdate(prevProps: WrapperProps) {
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

  const ConnectedWrapper: unknown = connect(
    (reduxState: S) => ({ [state]: reduxState }),
    {},
    undefined,
    { getDisplayName: name => `InnerConnect(${name})` },
  )(Wrapper as ComponentType<any>);

  return ConnectedWrapper as ReselectConnectedComponent<C, P>;
};
