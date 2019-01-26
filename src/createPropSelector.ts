import createPathSelector from './createPathSelector';

export default <P>() => createPathSelector((state: {}, props: P) => props);
