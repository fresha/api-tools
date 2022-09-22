import { register as registerElixirCodegen } from '@fresha/openapi-codegen-server-elixir';
import { register as registerNestJSCodegen } from '@fresha/openapi-codegen-server-nestjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).usage('Usage');

registerNestJSCodegen(argv);
registerElixirCodegen(argv);

argv.parseSync();
