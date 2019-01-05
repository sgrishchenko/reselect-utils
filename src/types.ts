export type Selector<S, R, D = []> = {
    (state: S): R,
    selectorName?: string,
    dependencies?: D
};

export type ParametricSelector<S, P, R, D = []> = {
    (state: S, props: P, ...args: any[]): R,
    selectorName?: string,
    dependencies?: D
};
