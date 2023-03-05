import fs from 'fs';
import path from 'path';

import yaml from 'yaml';

import { OpenAPIReader } from './OpenAPIReader';

import type { OpenAPIObject } from '../types';
import { TreeNode } from './types';

const lines: string[] = [];

const visit = (obj: { children: () => IterableIterator<TreeNode<unknown>>; }, indent: number = 0): void => {
  lines.push(`${obj.constructor.name}`.padStart(indent));
  for (const child of obj.children()) {
    visit(child, indent + 2);
  }
};

test('example api',
  () => {
    const reader = new OpenAPIReader();

    const inputText = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'examples', 'json-api.yaml'),
      'utf-8',
    );
    const inputData = yaml.parse(inputText) as OpenAPIObject;

    const openapi = reader.parse(inputData);
    visit(openapi);

    global.console.log(lines.join('\n'));
  },
);
