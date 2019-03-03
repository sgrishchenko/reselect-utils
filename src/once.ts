import CounterObjectCache from './CounterObjectCache';
import { ParametricSelector, Selector } from './types';

export default <S, P, R>(
  selector: Selector<S, R> | ParametricSelector<S, P, R>,
) => (state: S, props: P) => {
  const result = selector(state, props);
  CounterObjectCache.addRefRecursively(selector)(state, props);
  CounterObjectCache.removeRefRecursively(selector)(state, props);

  return result;
};
