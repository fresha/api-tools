import { register as registerClientCodegen } from '@fresha/openapi-codegen-client-typescript';
import { register as registerElixirCodegen } from '@fresha/openapi-codegen-server-elixir';
import * as nestJsCommand from '@fresha/openapi-codegen-server-nestjs/build/command';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).usage('Usage');

argv.command(nestJsCommand);

registerClientCodegen(argv);
registerElixirCodegen(argv);

argv.parseSync();
