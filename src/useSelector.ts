import { useCallback, useEffect, useRef } from 'react';
import { useSelector as useReduxSelector, shallowEqual } from 'react-redux';
import { ParametricSelector, Selector } from './types';
import CounterObjectCache from './CounterObjectCache';

export type UseSelectorOptions = {
  updateRefsOnStateChange?: boolean;
};

export const defaultOptions: Required<UseSelectorOptions> = {
  updateRefsOnStateChange: false,
};

function usePrev<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function useSelector<S, R>(selector: Selector<S, R>): R;

function useSelector<S, R>(
  selector: Selector<S, R>,
  props: null | undefined,
  options: UseSelectorOptions,
): R;

function useSelector<S, P, R>(
  selector: ParametricSelector<S, P, R>,
  props: P,
  options?: UseSelectorOptions,
): R;

function useSelector(selector: any, props?: any, options?: any) {
  const resolvedOptions = {
    ...defaultOptions,
    ...options,
  };

  const { updateRefsOnStateChange } = resolvedOptions;

  const stateSelector = useCallback(
    currentState => (updateRefsOnStateChange ? currentState : null),
    [updateRefsOnStateChange],
  );

  const state = useReduxSelector(stateSelector);
  const result = useReduxSelector(currentState => {
    const selectionResult = selector(currentState, props);

    if (process.env.NODE_ENV !== 'production') {
      CounterObjectCache.confirmValidAccessRecursively(selector)(
        currentState,
        props,
      );
    }

    return selectionResult;
  });

  const isMountedRef = useRef(false);
  const isMounted = isMountedRef.current;

  // mount / unmount
  useEffect(() => {
    isMountedRef.current = true;
    CounterObjectCache.addRefRecursively(selector)(state, props);

    return () => {
      CounterObjectCache.removeRefRecursively(selector)(state, props);
    };
  }, []);

  const prevState = usePrev(state);
  const prevProps = usePrev(props);

  // update
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const needUpdateRefs =
      state !== prevState || !shallowEqual(props, prevProps);

    if (needUpdateRefs) {
      CounterObjectCache.removeRefRecursively(selector)(prevState, prevProps);
      CounterObjectCache.addRefRecursively(selector)(state, props);
    }
  });

  return result;
}

export default useSelector;
