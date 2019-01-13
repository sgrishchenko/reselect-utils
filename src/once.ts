import { OutputParametricCachedSelector } from 're-reselect';
import CounterObjectCache from './CounterObjectCache';

export default <S, P, R>(
  selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>,
) => (state: S, props: P) => {
  const result = selector(state, props);
  CounterObjectCache.addRefRecursively(selector)(state, props);
  CounterObjectCache.removeRefRecursively(selector)(state, props);

  return result;
};
