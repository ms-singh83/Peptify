import { parseDecimal } from '../number';

describe('parseDecimal', () => {
  it.each([
    ['5', 5],
    ['1.5', 1.5],
    ['1,5', 1.5],
    ['.5', 0.5],
    ['2.', 2],
    [' 250 ', 250],
  ])('parses %p', (input, expected) => {
    expect(parseDecimal(input)).toBe(expected);
  });

  it.each(['', ' ', 'abc', '1.2.3', '-1', '1e3', '1,2,3'])('rejects %p', (input) => {
    expect(parseDecimal(input)).toBeNull();
  });
});
