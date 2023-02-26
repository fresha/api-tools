import * as fetchClientCommand from '@fresha/openapi-codegen-client-fetch/build/command';
import * as jsonApiDocgenCommand from '@fresha/openapi-codegen-docs-json-api/build/command';
import * as elixirCodegenCommand from '@fresha/openapi-codegen-server-elixir/build/command';
import * as mockServerCommand from '@fresha/openapi-codegen-server-mock/build/command';
import * as nestJsServerCommand from '@fresha/openapi-codegen-server-nestjs/build/command';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .epilog(
    'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-codegen',
  )
  .usage('Usage: $0 GENERATOR_NAME [OPTIONS]')
  .demandCommand(1, 'Please specify generator name');

type CommandModule = yargs.CommandModule<Record<string, unknown>, unknown>;

argv.command(fetchClientCommand as unknown as CommandModule);
argv.command(elixirCodegenCommand as unknown as CommandModule);
argv.command(jsonApiDocgenCommand as unknown as CommandModule);
argv.command(mockServerCommand as unknown as CommandModule);
argv.command(nestJsServerCommand as unknown as CommandModule);

argv.parseSync();
