import {ParametricSelector, Selector} from "./types";

export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>

const generateMappingName = (mapping: {}) => (
    `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`
);

export function createAdaptedSelector<S, P1, P2, R>(
    baseSelector: ParametricSelector<S, P1, R>,
    mapping: (props: P2) => P1
): ParametricSelector<S, P2, R>

export function createAdaptedSelector<S, P1, P2 extends Partial<P1>, R>(
    baseSelector: ParametricSelector<S, P1, R>,
    binding: P2
): Exclude<keyof P1, keyof P2> extends never
    ? Selector<S, R>
    : ParametricSelector<S, Diff<P1, P2>, R>

export function createAdaptedSelector(baseSelector: any, mappingOrBinding: any) {
    const baseName = baseSelector.selectorName || baseSelector.name;

    if (typeof mappingOrBinding === "function") {
        const mapping = mappingOrBinding;

        const resultSelector: any = (state: any, props: any) => baseSelector(state, mapping(props));

        const mappingResult = mapping(new Proxy(
            {},
            {
                get: (target, key) => key
            },
        ));

        const mappingName = mapping.name || generateMappingName(mappingResult);

        resultSelector.selectorName = `${baseName} (${mappingName})`;
        resultSelector.dependencies = [baseSelector];

        return resultSelector
    }

    const binding = mappingOrBinding;

    const resultSelector: any = (state: any, props: any) => baseSelector(state, {
        ...(props || {}),
        ...(binding || {}),
    });

    const mappingName = generateMappingName(binding);

    resultSelector.selectorName = `${baseName} (${mappingName})`;
    resultSelector.dependencies = [baseSelector];

    return resultSelector;
}