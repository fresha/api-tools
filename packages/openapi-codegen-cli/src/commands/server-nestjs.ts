import {
  createContext,
  CreateContextParams,
  Generator,
} from '@fresha/openapi-codegen-server-nestjs';

import { builder as baseBuilder } from './common';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-nestjs';

export const description = 'generates code for NestJS';

export const builder = (yarg: Argv): Argv<CreateContextParams> =>
  baseBuilder(yarg)
    .string('nest-app')
    .describe('nest-app', 'Create files inside given NestJS application name');

export const handler = (args: ArgumentsCamelCase<CreateContextParams>): void => {
  const context = createContext(args);
  const generator = new Generator(context);
  // TODO refactor the generator (similarly to client-fetch), then remove this line
  context.addDTO = generator.addDTO.bind(generator);
  generator.run();
};
