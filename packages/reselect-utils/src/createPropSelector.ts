import { createPathSelector } from './createPathSelector';

export const createPropSelector = <P>() => {
  const propsSelector = (state: unknown, props: P) => props;
  return createPathSelector(propsSelector);
};
