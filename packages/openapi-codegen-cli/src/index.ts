import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import * as fetchClientCommand from './commands/client-fetch';
import * as jsonApiDocgenCommand from './commands/docs-json-api';
import * as elixirServerCommand from './commands/server-elixir';
import * as mockServerCommand from './commands/server-mock';
import * as nestJsServerCommand from './commands/server-nestjs';

const argv = yargs(hideBin(process.argv))
  .epilog(
    'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-codegen',
  )
  .usage('Usage: $0 GENERATOR_NAME [OPTIONS]')
  .demandCommand(1, 'Please specify generator name');

type CommandModule = yargs.CommandModule<Record<string, unknown>, unknown>;

argv.command(fetchClientCommand as unknown as CommandModule);
argv.command(elixirServerCommand as unknown as CommandModule);
argv.command(jsonApiDocgenCommand as unknown as CommandModule);
argv.command(mockServerCommand as unknown as CommandModule);
argv.command(nestJsServerCommand as unknown as CommandModule);

argv.parseSync();
