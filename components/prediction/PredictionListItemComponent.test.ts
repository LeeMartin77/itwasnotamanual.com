import { stringifyVoteNumber } from "./PredictionListItemComponent";

describe("String Vote Parser", () => {
  const cases = [
    [100, "100"],
    [-100, "100"],
    [0, "0"],
    [999, "999"],
    [1000, "1.0k"],
    [1034, "1.0k"],
    [2356, "2.3k"],
    [-5656, "5.6k"],
    [12656, "12.6k"],
  ];
  test.each(cases)("Returns correct string for each number", (num, str) => {
    expect(stringifyVoteNumber(num as number)).toBe(str);
  });
});
