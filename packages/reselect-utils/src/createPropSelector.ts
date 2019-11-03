import { createPathSelector } from './createPathSelector';

export const createPropSelector = <P>() => {
  const propsSelector = (state: {}, props: P) => props;
  return createPathSelector(propsSelector);
};
