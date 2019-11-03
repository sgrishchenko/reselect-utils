import { createPropSelector } from '../createPropSelector';

describe('createPropSelector', () => {
  test('should implement basic access to properties', () => {
    type Props = {
      range?: {
        from?: number;
        to?: number;
      };
    };
    const props: Props = {
      range: {
        from: 30,
        to: 70,
      },
    };

    const propSelector = createPropSelector<Props>();

    expect(propSelector.range.from()({}, props)).toEqual(30);
    expect(propSelector.range.to()({}, props)).toEqual(70);

    expect(propSelector.range.from(0)({}, {})).toEqual(0);
    expect(propSelector.range.to(100)({}, {})).toEqual(100);
  });
});
