import { ParametricSelector } from 'reselect';
import {
  innerCreatePathSelector,
  RequiredPathParametricSelectorType,
} from './createPathSelector';

export function createPropSelector<P>(): RequiredPathParametricSelectorType<
  unknown,
  P,
  P,
  [ParametricSelector<unknown, P, P>]
>;

export function createPropSelector() {
  const propsSelector = (state: unknown, props: unknown) => props;
  return innerCreatePathSelector(propsSelector, [], { isPropSelector: true });
}
