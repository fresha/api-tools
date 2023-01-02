import { OpenAPIReader, OpenAPIWriter } from '@fresha/openapi-model/build/3.0.3';
import glob from 'glob';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Linter } from './Linter';

try {
  const argv = yargs(hideBin(process.argv))
    .epilog(
      'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-lint',
    )
    .usage('Usage: $0 [OPTIONS] FILES')
    .string('config')
    .alias('config', 'c')
    .describe('config', 'Path to configuration file')
    .boolean('fix')
    .describe('fix', 'Automatically fix problems')
    .boolean('verbose')
    .alias('verbose', 'v')
    .describe('verbose', 'Print more information on console')
    .parseSync();

  const reader = new OpenAPIReader();

  const linter = new Linter({
    configPath: argv.config,
    autoFix: !!argv.fix,
    verbose: !!argv.verbose,
  });
  linter.configure();

  for (const elem of argv._) {
    if (typeof elem === 'string') {
      for (const fpath of glob.sync(String(elem))) {
        const openapi = reader.parseFromFile(fpath);
        if (linter.run(openapi, fpath)) {
          const writer = new OpenAPIWriter();
          writer.writeToFile(openapi, fpath);
        }
      }
    }
  }

  linter.print();
} catch (err) {
  global.console.log(err);
  process.exit(1);
}
