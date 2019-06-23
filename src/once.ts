import CounterObjectCache from './CounterObjectCache';
import { ParametricSelector, Selector } from './types';

function once<S, R>(selector: Selector<S, R>): Selector<S, R>;

function once<S, P, R>(
  selector: ParametricSelector<S, P, R>,
): ParametricSelector<S, P, R>;

function once(selector: any) {
  return (state: any, props: any) => {
    const result = selector(state, props);
    CounterObjectCache.addRefRecursively(selector)(state, props);
    CounterObjectCache.removeRefRecursively(selector)(state, props);

    return result;
  };
}

export default once;
