import { KeySelector, ParametricKeySelector } from 're-reselect';

export function composeKeySelectors<S1>(
  keySelector1: KeySelector<S1>,
): KeySelector<S1>;

export function composeKeySelectors<S1, P1>(
  keySelector1: ParametricKeySelector<S1, P1>,
): ParametricKeySelector<S1, P1>;

export function composeKeySelectors<S1, S2>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
): KeySelector<S1 & S2>;

export function composeKeySelectors<S1, S2, P1, P2>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
): ParametricKeySelector<S1 & S2, P1 & P2>;

export function composeKeySelectors<S1, S2, S3>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
): KeySelector<S1 & S2 & S3>;

export function composeKeySelectors<S1, S2, S3, P1, P2, P3>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
): ParametricKeySelector<S1 & S2 & S3, P1 & P2 & P3>;

export function composeKeySelectors<S1, S2, S3, S4>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
): KeySelector<S1 & S2 & S3 & S4>;

export function composeKeySelectors<S1, S2, S3, S4, P1, P2, P3, P4>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
): ParametricKeySelector<S1 & S2 & S3 & S4, P1 & P2 & P3 & P4>;

export function composeKeySelectors<S1, S2, S3, S4, S5>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
): KeySelector<S1 & S2 & S3 & S4 & S5>;

export function composeKeySelectors<S1, S2, S3, S4, S5, P1, P2, P3, P4, P5>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
): ParametricKeySelector<S1 & S2 & S3 & S4 & S5, P1 & P2 & P3 & P4 & P5>;

export function composeKeySelectors<S1, S2, S3, S4, S5, S6>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6,
  P1 & P2 & P3 & P4 & P5 & P6
>;

export function composeKeySelectors<S1, S2, S3, S4, S5, S6, S7>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7,
  P1 & P2 & P3 & P4 & P5 & P6 & P7
>;

export function composeKeySelectors<S1, S2, S3, S4, S5, S6, S7, S8>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
  keySelector8: KeySelector<S8>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
  keySelector8: ParametricKeySelector<S8, P8>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8,
  P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8
>;

export function composeKeySelectors<S1, S2, S3, S4, S5, S6, S7, S8, S9>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
  keySelector8: KeySelector<S8>,
  keySelector9: KeySelector<S9>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
  keySelector8: ParametricKeySelector<S8, P8>,
  keySelector9: ParametricKeySelector<S9, P9>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9,
  P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9
>;

export function composeKeySelectors<S1, S2, S3, S4, S5, S6, S7, S8, S9, S10>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
  keySelector8: KeySelector<S8>,
  keySelector9: KeySelector<S9>,
  keySelector10: KeySelector<S10>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9,
  P10
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
  keySelector8: ParametricKeySelector<S8, P8>,
  keySelector9: ParametricKeySelector<S9, P9>,
  keySelector10: ParametricKeySelector<S10, P10>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10,
  P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10
>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11
>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
  keySelector8: KeySelector<S8>,
  keySelector9: KeySelector<S9>,
  keySelector10: KeySelector<S10>,
  keySelector11: KeySelector<S11>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9,
  P10,
  P11
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
  keySelector8: ParametricKeySelector<S8, P8>,
  keySelector9: ParametricKeySelector<S9, P9>,
  keySelector10: ParametricKeySelector<S10, P10>,
  keySelector11: ParametricKeySelector<S11, P11>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11,
  P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11
>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11,
  S12
>(
  keySelector1: KeySelector<S1>,
  keySelector2: KeySelector<S2>,
  keySelector3: KeySelector<S3>,
  keySelector4: KeySelector<S4>,
  keySelector5: KeySelector<S5>,
  keySelector6: KeySelector<S6>,
  keySelector7: KeySelector<S7>,
  keySelector8: KeySelector<S8>,
  keySelector9: KeySelector<S9>,
  keySelector10: KeySelector<S10>,
  keySelector11: KeySelector<S11>,
  keySelector12: KeySelector<S12>,
): KeySelector<S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12>;

export function composeKeySelectors<
  S1,
  S2,
  S3,
  S4,
  S5,
  S6,
  S7,
  S8,
  S9,
  S10,
  S11,
  S12,
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9,
  P10,
  P11,
  P12
>(
  keySelector1: ParametricKeySelector<S1, P1>,
  keySelector2: ParametricKeySelector<S2, P2>,
  keySelector3: ParametricKeySelector<S3, P3>,
  keySelector4: ParametricKeySelector<S4, P4>,
  keySelector5: ParametricKeySelector<S5, P5>,
  keySelector6: ParametricKeySelector<S6, P6>,
  keySelector7: ParametricKeySelector<S7, P7>,
  keySelector8: ParametricKeySelector<S8, P8>,
  keySelector9: ParametricKeySelector<S9, P9>,
  keySelector10: ParametricKeySelector<S10, P10>,
  keySelector11: ParametricKeySelector<S11, P11>,
  keySelector12: ParametricKeySelector<S12, P12>,
): ParametricKeySelector<
  S1 & S2 & S3 & S4 & S5 & S6 & S7 & S8 & S9 & S10 & S11 & S12,
  P1 & P2 & P3 & P4 & P5 & P6 & P7 & P8 & P9 & P10 & P11 & P12
>;

export function composeKeySelectors<S>(
  ...keySelectors: KeySelector<S>[]
): KeySelector<S>;

export function composeKeySelectors<S, P>(
  ...keySelectors: ParametricKeySelector<S, P>[]
): ParametricKeySelector<S, P>;

export function composeKeySelectors(...keySelectors: Function[]) {
  return (state: unknown, props: unknown) => {
    let key = keySelectors[0](state, props);

    for (let i = 1; i < keySelectors.length; i += 1) {
      key += ':';
      key += keySelectors[i](state, props);
    }

    return key;
  };
}
