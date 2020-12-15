import { ParametricSelector } from 'reselect';
import {
  innerCreatePathSelector,
  RequiredPathParametricSelectorType,
} from './createPathSelector';

const propSelectorSymbol = Symbol.for('PropSelector');

export const isPropSelector = (selector: unknown) =>
  selector instanceof Object && propSelectorSymbol in selector;

export function createPropSelector<P>(): RequiredPathParametricSelectorType<
  unknown,
  P,
  P,
  [ParametricSelector<unknown, P, P>]
>;

export function createPropSelector() {
  const propsSelector = (state: unknown, props: unknown) => props;

  const applyMeta = (selector: unknown) => {
    Object.defineProperty(selector, propSelectorSymbol, { value: true });
  };

  return innerCreatePathSelector(propsSelector, [], applyMeta);
}
