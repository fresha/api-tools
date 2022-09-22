import * as prettier from 'prettier';

import type { SourceFile } from 'ts-morph';

expect.extend({
  toHaveFormattedText: (
    sourceFile: SourceFile,
    textToCompare: string,
  ): jest.CustomMatcherResult => {
    const options: prettier.Options = {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    };
    const thisText = prettier.format(sourceFile.getText(), options);
    const otherText = prettier.format(textToCompare, options);

    if (thisText !== otherText) {
      return {
        pass: false,
        message: () => `Source text differs. Expected '${otherText}', got '${thisText}'`,
      };
    }

    return {
      pass: true,
      message: () => 'Source text is the same',
    };
  },
});
