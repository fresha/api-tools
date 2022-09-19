import { register as registerNestJSCodegen } from '@fresha/openapi-codegen-server-nestjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).usage('Usage');

registerNestJSCodegen(argv);

argv.parseSync();
