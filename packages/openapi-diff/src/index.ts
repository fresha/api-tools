import assert from 'assert';
import console from 'console';
import fs from 'fs';

import { OpenAPIObject, OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import yaml from 'yaml';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Differ } from './Differ';

import './model';

try {
  const argv = yargs(hideBin(process.argv))
    .epilog(
      'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-diff',
    )
    .usage('Usage: $0 [OPTIONS] FILE1 FILE2')
    .boolean('print-version')
    .describe('print-version', 'Prints suggested new version')
    .boolean('update-version')
    .describe('update-version', 'Updates schema version based on changes')
    .boolean('verbose')
    .alias('verbose', 'v')
    .describe('verbose', 'Print more information on console')
    .parseSync();

  const [inputPath1, inputPath2] = argv._;
  assert(typeof inputPath1 === 'string', `Required a filename`);
  assert(typeof inputPath2 === 'string', `Required a filename`);

  const reader = new OpenAPIReader();
  const openapi1 = reader.parseFromFile(inputPath1);
  const openapi2 = reader.parseFromFile(inputPath2);

  const differ = new Differ(openapi1, openapi2);
  differ.calculate();

  if (argv.printVersion) {
    const suggestedNewVersion = differ.newVersion;
    console.log(suggestedNewVersion);
  } else if (argv.updateVersion) {
    // temporarily use yaml, to retain attribute order
    const inputText = fs.readFileSync(inputPath2, 'utf-8');
    const data = yaml.parse(inputText) as OpenAPIObject;

    data.info.version = differ.newVersion;

    const text = yaml.stringify(data);
    fs.writeFileSync(inputPath2, text, 'utf-8');

    // openapi2.info.version = differ.newVersion;
    // const writer = new OpenAPIWriter();
    // writer.writeToFile(openapi2, inputPath2);
  } else {
    differ.print();
    if (differ.outdatedVersion) {
      process.exit(1);
    }
  }
} catch (err) {
  console.log(err);
  process.exit(1);
}
