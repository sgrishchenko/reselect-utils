import { createPathSelector } from '../createPathSelector';
import {state, State} from "../__data__/state";

describe('createPathSelector', () => {
    test('should implement basic access to state properties', () => {

        const baseSelector = (state: State) => state;
        const pathSelector = createPathSelector(baseSelector);

        expect(pathSelector.messages[100].text()(state)).toEqual('Hello');
        expect(pathSelector.messages[300].text()(state)).toBeUndefined();
        expect(pathSelector.messages[300].text('Default')(state)).toBe('Default');

        expect((pathSelector as any).y.z.a.b.c.d.e.f.g.h.i.j.k()(state)).toBeUndefined();
    });
});