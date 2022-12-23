import {
  MatcherHintOptions,
  matcherHint,
  printDiffOrStringify,
  printExpected,
  printReceived,
  stringify,
} from 'jest-matcher-utils';
import * as prettier from 'prettier';

import { poorMansElixirFormat } from './elixir';

const EXPECTED_LABEL = 'Expected';
const RECEIVED_LABEL = 'Received';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars
  namespace jest {
    interface Matchers<R> {
      toHaveFormattedElixirText(test: string): R;
      toHaveFormattedTypeScriptText(text: string): R;
    }
  }
}

type SourceFile = {
  getText(): string;
};

const compareText = (
  received: string,
  expected: string,
  matcherName: string,
): jest.CustomMatcherResult => {
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
};

export const createMatchers = () => ({
  toHaveFormattedElixirText: (
    sourceFile: SourceFile,
    expectedText: string,
  ): jest.CustomMatcherResult => {
    return compareText(
      poorMansElixirFormat(sourceFile.getText()),
      poorMansElixirFormat(expectedText),
      'toHaveFormattedElixirText',
    );
  },

  toHaveFormattedTypeScriptText: (
    sourceFile: SourceFile,
    expectedText: string,
  ): jest.CustomMatcherResult => {
    const options: prettier.Options = {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    };
    const received = prettier.format(sourceFile.getText(), options);
    const expected = prettier.format(expectedText, options);

    return compareText(received, expected, 'toHaveFormattedTypeScriptText');
  },
});
