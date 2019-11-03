import { ParametricSelector } from 'reselect';
import { useSelector } from 'react-redux';

export const useParametricSelector = <S, P, R>(
  selector: ParametricSelector<S, P, R>,
  props: P,
) => {
  return useSelector((state: S) => selector(state, props));
};
