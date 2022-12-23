import {
  MatcherHintOptions,
  matcherHint,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';
import * as prettier from 'prettier';

import type { SourceFile } from 'ts-morph';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveFormattedText(text: string): R;
    }
  }
}

export const createMatchers = () => {
  expect.extend({
    toHaveFormattedText: (sourceFile: SourceFile, expectedText: string): jest.CustomMatcherResult => {
      const options: prettier.Options = {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
      };
      const received = prettier.format(sourceFile.getText(), options);
      const expected = prettier.format(expectedText, options);

      const matcherName = 'toHaveFormattedText';
      const matcherOptions: MatcherHintOptions = {
        comment: 'deep equality',
      };
      const pass = received === expected;

      const message = pass
        ? () =>
            // eslint-disable-next-line prefer-template
            matcherHint(matcherName, undefined, undefined, matcherOptions) +
            '\n\n' +
            `Expected: not ${printExpected(expected)}\n` +
            (stringify(expected) !== stringify(received)
              ? `Received:     ${printReceived(received)}`
              : '')
        : () =>
            // eslint-disable-next-line prefer-template
            matcherHint(matcherName, undefined, undefined, matcherOptions) +
            '\n\n' +
            printDiffOrStringify(expected, received, EXPECTED_LABEL, RECEIVED_LABEL, true);

      return { message, pass };
    },
  });
};
