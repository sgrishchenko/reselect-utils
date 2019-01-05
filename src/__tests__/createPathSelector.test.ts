import { createPathSelector } from '../createPathSelector';

describe('createPathSelector', () => {
    it('sanity checks', () => {
        interface X {
            a: string;
            b: { d: string };
            c: number[];
            d: { e: string } | null;
            e: { f: boolean } | null;
        }

        const baseSelector = (state: {x: X}) => state.x;
        const state = {
          x: {
              a: 'hello',
              b: {
                  d: 'world',
              },
              c: [-100, 200, -300],
              d: null,
              e: { f: false },
          }
        };

        const x = createPathSelector(baseSelector);

        expect(x.a()(state)).toEqual('hello');
        expect(x.b.d()(state)).toEqual('world');
        expect(x.c[0]()(state)).toEqual(-100);
        expect(x.c[100]()(state)).toBeUndefined();
        expect(x.c[100](1234)(state)).toEqual(1234);
        expect(x.d.e()(state)).toBeUndefined();
        expect(x.d.e('optional default value')(state)).toEqual('optional default value');
        expect(x.e.f()(state)).toEqual(false);
        expect((x as any).y.z.a.b.c.d.e.f.g.h.i.j.k()(state)).toBeUndefined();
    });
});