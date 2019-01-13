import createPathSelector from '../createPathSelector';
import { commonState, State } from '../__data__/state';

describe('createPathSelector', () => {
  test('should implement basic access to state properties', () => {
    const baseSelector = (state: State) => state;
    const pathSelector = createPathSelector(baseSelector);

    const baseParametricSelector = (state: State, props: { id: number }) =>
      state.documents[props.id];
    const pathParametricSelector = createPathSelector(baseParametricSelector);

    expect(pathSelector.messages[100].text()(commonState)).toEqual('Hello');
    expect(pathSelector.messages[300].text()(commonState)).toBeUndefined();
    expect(pathSelector.messages[300].text('Default')(commonState)).toBe(
      'Default',
    );

    expect(
      pathParametricSelector.messageId()(commonState, { id: 111 }),
    ).toEqual(100);
    expect(pathParametricSelector.data[0]()(commonState, { id: 111 })).toEqual(
      1,
    );
    expect(
      pathParametricSelector.messageId()(commonState, { id: 333 }),
    ).toBeUndefined();
    expect(
      pathParametricSelector.messageId(100500)(commonState, { id: 333 }),
    ).toBe(100500);

    expect(
      (pathSelector as any).y.z.a.b.c.d.e.f.g.h.i.j.k()(commonState),
    ).toBeUndefined();
    expect(
      (pathParametricSelector as any).y.z.a.b.c.d.e.f.g.h.i.j.k()(
        commonState,
        {},
      ),
    ).toBeUndefined();
  });
});
