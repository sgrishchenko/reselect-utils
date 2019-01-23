export type Selector<S, R, D = any[]> = {
  (state: S): R;
  selectorName?: string;
  dependencies?: D;
};

export type ParametricSelector<S, P, R, D = any[]> = {
  (state: S, props: P, ...args: any[]): R;
  selectorName?: string;
  dependencies?: D;
};
