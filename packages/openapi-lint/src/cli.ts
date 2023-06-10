import console from 'console';

import { OpenAPIReader, OpenAPIWriter } from '@fresha/openapi-model/build/3.0.3';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createFormatter } from './formatters';
import { loadConfigFromFile, createLinter } from './linter';

try {
  const argv = yargs(hideBin(process.argv))
    .epilog(
      'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-lint',
    )
    .usage('Usage: $0 [OPTIONS] FILES')
    .string('config')
    .alias('config', 'c')
    .describe('config', 'Path to configuration file')
    .boolean('print-config')
    .describe('print-config', 'Print configuration and exit')
    .number('max-warnings')
    .describe('max-warnings', 'Number of warnings to trigger nonzero exit code')
    .boolean('fix')
    .describe('fix', 'Automatically fix problems')
    .choices('formatter', ['simple', 'json'])
    .default('formatter', 'simple')
    .alias('formatter', 'f')
    .boolean('verbose')
    .alias('verbose', 'v')
    .describe('verbose', 'Print more information on console')
    .parseSync();

  const config = loadConfigFromFile(argv.config ?? '.openapi-lint.yaml');
  if (argv.printConfig) {
    config.print();
  }

  const linter = createLinter({
    config,
    maxWarnings: argv.maxWarnings ?? -1,
    autoFix: !!argv.fix,
    verbose: !!argv.verbose,
  });

  for (const elem of argv._) {
    const fpath = String(elem);
    try {
      const openapi = new OpenAPIReader().parseFromFile(fpath);
      openapi.setExtension('__filename', fpath);

      if (linter.run(openapi)) {
        const writer = new OpenAPIWriter();
        openapi.deleteExtension('__filename');
        writer.writeToFile(openapi, fpath);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err instanceof Error ? err.message : err);
      }
    }
  }

  const formatter = createFormatter(argv.formatter);
  formatter.format(linter.result);

  process.exit(linter.result.isFailure ? 1 : 0);
} catch (err) {
  console.log(err instanceof Error ? err.message : err);
  process.exit(1);
}
