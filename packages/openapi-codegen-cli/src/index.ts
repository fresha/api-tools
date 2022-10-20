import * as fetchClientCommand from '@fresha/openapi-codegen-client-fetch/build/command';
import * as freshaClientCommand from '@fresha/openapi-codegen-client-fresha/build/command';
import * as elixirCodegenCommand from '@fresha/openapi-codegen-server-elixir/build/command';
import * as nestJsServerCommand from '@fresha/openapi-codegen-server-nestjs/build/command';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .epilog(
    'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-codegen',
  )
  .usage('Usage: $0 GENERATOR_NAME [OPTIONS]')
  .demandCommand(1, 'Please specify generator name');

argv.command(freshaClientCommand);
argv.command(fetchClientCommand);
argv.command(nestJsServerCommand);
argv.command(elixirCodegenCommand);

argv.parseSync();
