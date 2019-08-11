import createPathSelector from './createPathSelector';

export default <P>() => {
  const propsSelector = (state: {}, props: P) => props;
  return createPathSelector(propsSelector);
};
