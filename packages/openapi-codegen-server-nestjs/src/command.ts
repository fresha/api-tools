import path from 'path';

import {
  builder as basicBuilder,
  Params as BasicParams,
  createContext,
} from '@fresha/openapi-codegen-utils';
import { Project } from 'ts-morph';

import { Generator } from './Generator';
import { getNestJSSubAppPath } from './utils';

import type { DTO } from './DTO';
import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-nestjs';

export const description = 'generates code for NestJS';

type Params = BasicParams & {
  nestApp?: string;
};

export const builder = (yarg: Argv): Argv<Params> =>
  basicBuilder(yarg)
    .string('nest-app')
    .describe('nest-app', 'Create files inside given NestJS application name');

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const project = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const context = createContext(args);

  const generator = new Generator({
    ...context,
    outputPath: getNestJSSubAppPath(args.output, args.nestApp),
    project,
    nestApp: args.nestApp ?? 'app',
    addDTO(name, schema): DTO {
      return generator.addDTO(name, schema);
    },
  });

  generator.run();
};
