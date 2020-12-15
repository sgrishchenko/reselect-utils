import { PreloadedState, Middleware, Dispatch } from 'redux';

export const createLocalStorageMiddleware = <S>(
  stateLocalStorageKey: string,
  project: (state: S) => PreloadedState<S>,
) => {
  let prevState: S;

  const middleware: Middleware<Dispatch, S> = ({ getState }) => (next) => (
    action,
  ) => {
    const result = next(action) as unknown;

    const nextState = getState();
    if (prevState !== nextState) {
      window.localStorage.setItem(
        stateLocalStorageKey,
        JSON.stringify(project(nextState)),
      );
      prevState = nextState;
    }

    return result;
  };

  return Object.assign(middleware, {
    getSavedState: (): PreloadedState<S> | undefined => {
      const savedState = window.localStorage.getItem(stateLocalStorageKey);
      return savedState
        ? (JSON.parse(savedState) as PreloadedState<S>)
        : undefined;
    },
  });
};
