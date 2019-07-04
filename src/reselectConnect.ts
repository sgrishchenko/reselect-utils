import { ComponentType, createElement, FunctionComponent } from 'react';
import { useSelector as useReduxSelector } from 'react-redux';
import { ParametricSelector, Selector } from './types';
import useSelector, { UseSelectorOptions } from './useSelector';
import CounterObjectCache from './CounterObjectCache';

export type ReselectConnectedComponent<
  C extends ComponentType<any>,
  P
> = C extends ComponentType<infer CP>
  ? CP extends P
    ? ComponentType<JSX.LibraryManagedAttributes<C, CP>>
    : never
  : never;

export default <S, P, R>(
  selector: Selector<S, R> | ParametricSelector<S, P, R>,
  options?: UseSelectorOptions,
) => <C extends ComponentType<any>>(WrappedComponent: C) => {
  const Wrapper: FunctionComponent<P> = props => {
    useSelector(selector, props, options);

    useReduxSelector((currentState: S) => {
      if (process.env.NODE_ENV !== 'production') {
        CounterObjectCache.confirmValidAccessRecursively(selector)(
          currentState,
          props,
        );
      }

      return null;
    });

    return createElement(WrappedComponent, props);
  };

  const wrappedComponentName =
    WrappedComponent.displayName ||
    /* istanbul ignore next */ WrappedComponent.name ||
    /* istanbul ignore next */ 'Component';

  Wrapper.displayName = `ReselectConnect(${wrappedComponentName})`;

  return Wrapper as ReselectConnectedComponent<C, P>;
};
