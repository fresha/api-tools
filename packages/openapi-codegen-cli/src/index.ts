import * as freshaClientCommand from '@fresha/openapi-codegen-client-fresha/build/command';
import { register as registerClientCodegen } from '@fresha/openapi-codegen-client-fetch';
import { register as registerElixirCodegen } from '@fresha/openapi-codegen-server-elixir';
import * as nestJsCommand from '@fresha/openapi-codegen-server-nestjs/build/command';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .epilog(
    'For more information, see https://github.com/fresha/api-tools/tree/main/packages/openapi-codegen',
  )
  .usage('Usage: $0 GENERATOR_NAME [OPTIONS]')
  .demandCommand(1, 'Please specify generator name');

argv.command(nestJsCommand);
argv.command(freshaClientCommand);

registerClientCodegen(argv);
registerElixirCodegen(argv);

argv.parseSync();
