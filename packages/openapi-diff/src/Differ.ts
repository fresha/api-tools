import assert from 'assert';
import console from 'console';

import { Nullable } from '@fresha/api-tools-core';
import chalk from 'chalk';

import { DiffItem } from './DiffItem';
import { Severity } from './types';

import type {
  ExternalDocumentationModel,
  OpenAPIModel,
  ParameterModel,
  PathItemOperationKey,
  SchemaModel,
  TagModel,
} from '@fresha/openapi-model/build/3.0.3';

const diffStringSet = (
  set1: Set<string>,
  set2: Set<string>,
): [Set<string>, Set<string>, Set<string>] => {
  const added = new Set<string>();
  const removed = new Set<string>();
  const stable = new Set<string>();
  for (const s of set1) {
    if (set2.has(s)) {
      stable.add(s);
    } else {
      removed.add(s);
    }
  }
  for (const s of set2) {
    if (!set1.has(s)) {
      added.add(s);
    }
  }
  return [added, removed, stable];
};

const diffMapKeys = <V>(
  map1: Map<string, V>,
  map2: Map<string, V>,
): [Set<string>, Set<string>, Set<string>] => {
  const keys1 = new Set<string>(map1.keys());
  const keys2 = new Set<string>(map2.keys());

  return diffStringSet(keys1, keys2);
};

export class Differ {
  readonly #model1: OpenAPIModel;
  readonly #model2: OpenAPIModel;
  readonly #items: DiffItem[];

  #outdatedVersion: boolean;
  #newVersion: string;

  constructor(model1: OpenAPIModel, model2: OpenAPIModel) {
    this.#model1 = model1;
    this.#model2 = model2;
    this.#items = [];
    this.#outdatedVersion = false;
    this.#newVersion = this.#model2.info.version;
  }

  calculate(): void {
    this.diffInfo();
    this.diffServers();
    this.diffPaths();
    this.diffComponents();
    this.diffSecurityRequirements();
    this.diffTags();
    this.diffExternalDocs(this.#model1.externalDocs, this.#model2.externalDocs, '#');

    this.calculateNewVersion();
  }

  protected diffInfo(): void {
    const info1 = this.#model1.info;
    const info2 = this.#model2.info;

    // x-id is a special extension, check it first
    const id1 = info1.getExtension('id');
    const id2 = info2.getExtension('id');
    assert(id1 === id2, `Expected #/info/x-id to be identical, but they were not`);

    if (info1.title !== info2.title) {
      this.#items.push(new DiffItem('#/info/title', 'major', 'changed'));
    }
    if (info1.description !== info2.description) {
      this.#items.push(new DiffItem('#/info/description', 'patch', 'changed'));
    }
    if (info1.termsOfService !== info2.termsOfService) {
      this.#items.push(new DiffItem('#/info/termsOfService', 'minor', 'changed'));
    }
    // skip info.version, because it is our output, not input

    // rest of extension fields
    const audience1 = info1.getExtension('audience');
    const audience2 = info2.getExtension('audience');
    if (audience1 !== audience2) {
      this.#items.push(new DiffItem('#/info/x-audience', 'major', 'changed'));
    }

    const rootUrl1 = info1.getExtension('root-url');
    const rootUrl2 = info2.getExtension('root-url');
    if (rootUrl1 !== rootUrl2) {
      this.#items.push(new DiffItem('#/info/x-root-url', 'minor', 'changed'));
    }

    this.diffContact();
    this.diffLicense();
  }

  protected diffContact(): void {
    const contact1 = this.#model1.info.contact;
    const contact2 = this.#model2.info.contact;

    if (contact1.name !== contact2.name) {
      this.#items.push(new DiffItem('#/info/contact/name', 'patch', `changed`));
    }
    if (contact1.url !== contact2.url) {
      this.#items.push(new DiffItem('#/info/contact/url', 'patch', 'changed'));
    }
    if (contact1.email !== contact2.email) {
      this.#items.push(new DiffItem('#/info/contact/email', 'patch', 'changed'));
    }
  }

  protected diffLicense(): void {
    const license1 = this.#model1.info.license;
    const license2 = this.#model2.info.license;

    if (license1.name !== license2.name) {
      this.#items.push(new DiffItem('#/info/license/name', 'minor', 'changed'));
    }
    if (license1.url !== license2.url) {
      this.#items.push(new DiffItem('#/info/license/url', 'minor', 'changed'));
    }
  }

  protected diffServers(): void {
    const len = Math.max(this.#model1.serverCount, this.#model2.serverCount);

    for (let i = 0; i < len; i += 1) {
      const server1 = this.#model1.serverAt(i);
      const server2 = this.#model2.serverAt(i);

      if (server1 == null && server2 != null) {
        this.#items.push(new DiffItem(`#/servers/${i}`, 'minor', `added`));
      } else if (server1 != null && server2 == null) {
        this.#items.push(new DiffItem(`#/servers/${i}`, 'minor', `removed`));
      } else {
        if (server1.url !== server2.url) {
          this.#items.push(new DiffItem(`#/servers/${i}/url`, 'minor', `changed`));
        }
        if (server1.description !== server2.description) {
          this.#items.push(new DiffItem(`#/servers/${i}/description`, 'patch', 'changed'));
        }
      }
    }
  }

  protected diffPaths(): void {
    const paths1 = this.#model1.paths;
    const paths2 = this.#model2.paths;
    const urls1 = new Set<string>(paths1.pathItemUrls());
    const urls2 = new Set<string>(paths2.pathItemUrls());

    const allUrls = new Set<string>([...urls1, ...urls2]);
    for (const url of allUrls) {
      if (urls1.has(url) && !urls2.has(url)) {
        this.#items.push(new DiffItem(`#/paths${url}`, 'major', `removed`));
      } else if (!urls1.has(url) && urls2.has(url)) {
        this.#items.push(new DiffItem(`#/paths${url}`, 'minor', `added`));
      } else {
        this.diffPathItem(url);
      }
    }
  }

  protected diffPathItem(pathUrl: string): void {
    const item1 = this.#model1.paths.getItemOrThrow(pathUrl);
    const item2 = this.#model2.paths.getItemOrThrow(pathUrl);

    if (item1.summary !== item2.summary) {
      this.#items.push(new DiffItem(`#/paths${pathUrl}/summary`, 'minor', `changed`));
    }
    if (item1.description !== item2.description) {
      this.#items.push(new DiffItem(`#/paths${pathUrl}/description`, 'patch', `changed`));
    }

    this.diffParameters(
      Array.from(item1.parameters()),
      Array.from(item2.parameters()),
      `#/paths${pathUrl}/parameters`,
    );

    const httpMethods: PathItemOperationKey[] = [
      'get',
      'put',
      'post',
      'delete',
      'options',
      'head',
      'patch',
      'trace',
    ];
    for (const httpMethod of httpMethods) {
      const operation1 = item1.getOperation(httpMethod);
      const operation2 = item2.getOperation(httpMethod);

      if (operation2 != null) {
        if (operation1 != null) {
          this.diffOperation(pathUrl, httpMethod);
        } else {
          this.#items.push(
            new DiffItem(`#/paths${pathUrl}/${httpMethod}`, 'minor', `operation added`),
          );
        }
      } else if (operation1 != null) {
        this.#items.push(
          new DiffItem(`#/paths${pathUrl}/${httpMethod}`, 'major', `operation removed`),
        );
      }
    }
  }

  protected diffParameters(
    parameters1: readonly ParameterModel[],
    parameters2: readonly ParameterModel[],
    basePointer: string,
  ): void {
    const params1 = new Map<string, [ParameterModel, number]>(
      parameters1.map((p, i) => [`${p.in}:${p.name}`, [p, i]]),
    );
    const params2 = new Map<string, [ParameterModel, number]>(
      parameters2.map((p, i) => [`${p.in}:${p.name}`, [p, i]]),
    );

    const [added, removed, stable] = diffStringSet(
      new Set<string>(params1.keys()),
      new Set<string>(params2.keys()),
    );
    for (const key of added) {
      const p = params2.get(key);
      assert(p);
      this.#items.push(
        new DiffItem(`${basePointer}/${p[1]}`, p[0].required ? 'major' : 'minor', `added ${key}`),
      );
    }
    for (const key of removed) {
      const p = params1.get(key);
      assert(p);
      this.#items.push(new DiffItem(`${basePointer}/${p[1]}`, 'major', `removed ${key}`));
    }
    for (const key of stable) {
      const param1 = params1.get(key);
      assert(param1);
      const param2 = params2.get(key);
      assert(param2);
      this.diffParameter(param1, param2, basePointer);
    }
  }

  protected diffParameter(
    [param1]: [ParameterModel, number],
    [param2, index2]: [ParameterModel, number],
    basePointer: string,
  ): void {
    if (param1.in !== param2.in) {
      this.#items.push(new DiffItem(`${basePointer}/${index2}/in`, 'major', 'changed'));
    }
    if (param1.name !== param2.name) {
      this.#items.push(new DiffItem(`${basePointer}/${index2}/name`, 'major', 'changed'));
    }
    if (param1.description !== param2.description) {
      this.#items.push(new DiffItem(`${basePointer}/${index2}/description`, 'patch', 'changed'));
    }
    if (param1.deprecated !== param2.deprecated) {
      this.#items.push(new DiffItem(`${basePointer}/${index2}/deprecated`, 'major', 'changed'));
    }
    if (param1.explode !== param2.explode) {
      this.#items.push(new DiffItem(`${basePointer}/${index2}/explode`, 'major', 'changed'));
    }

    // schema
    this.diffSchema(param1.schema, param2.schema, `${basePointer}/${index2}/schema`);

    // example, examples - skip, because it does not affect version
    // content
  }

  protected diffSchema(
    schema1: Nullable<SchemaModel>,
    schema2: Nullable<SchemaModel>,
    basePointer: string,
  ): void {
    if (schema2 != null) {
      if (schema1 != null) {
        if (schema1.title !== schema2.title) {
          this.#items.push(new DiffItem(`${basePointer}/title`, 'minor', 'changed'));
        }
        if (schema1.multipleOf !== schema2.multipleOf) {
          this.#items.push(new DiffItem(`${basePointer}/multipleOf`, 'major', 'changed'));
        }
        if (schema1.maximum !== schema2.maximum) {
          this.#items.push(new DiffItem(`${basePointer}/maximum`, 'major', 'changed'));
        }
        if (schema1.exclusiveMaximum !== schema2.exclusiveMaximum) {
          this.#items.push(new DiffItem(`${basePointer}/exclusiveMaximum`, 'major', 'changed'));
        }
        if (schema1.minimum !== schema2.minimum) {
          this.#items.push(new DiffItem(`${basePointer}/minimum`, 'major', 'changed'));
        }
        if (schema1.exclusiveMinimum !== schema2.exclusiveMinimum) {
          this.#items.push(new DiffItem(`${basePointer}/exclusiveMinimum`, 'major', 'changed'));
        }
        if (schema1.maxLength !== schema2.maxLength) {
          this.#items.push(new DiffItem(`${basePointer}/maxLength`, 'major', 'changed'));
        }
        if (schema1.minLength !== schema2.minLength) {
          this.#items.push(new DiffItem(`${basePointer}/minLength`, 'major', 'changed'));
        }
        if (schema1.pattern !== schema2.pattern) {
          this.#items.push(new DiffItem(`${basePointer}/pattern`, 'major', 'changed'));
        }
        if (schema1.minItems !== schema2.minItems) {
          this.#items.push(new DiffItem(`${basePointer}/minItems`, 'major', 'changed'));
        }
        if (schema1.maxItems !== schema2.maxItems) {
          this.#items.push(new DiffItem(`${basePointer}/maxItems`, 'major', 'changed'));
        }
        if (schema1.uniqueItems !== schema2.uniqueItems) {
          this.#items.push(new DiffItem(`${basePointer}/uniqueItems`, 'major', 'changed'));
        }
        if (schema1.maxProperties !== schema2.maxProperties) {
          this.#items.push(new DiffItem(`${basePointer}/maxProperties`, 'major', 'changed'));
        }
        if (schema1.minProperties !== schema2.minProperties) {
          this.#items.push(new DiffItem(`${basePointer}/minProperties`, 'major', 'changed'));
        }

        const [addedRequired, removedRequired] = diffStringSet(
          new Set<string>(schema1.requiredPropertyNames()),
          new Set<string>(schema2.requiredPropertyNames()),
        );
        for (const p of addedRequired) {
          this.#items.push(new DiffItem(`${basePointer}/required`, 'major', `added ${p}`));
        }
        for (const p of removedRequired) {
          this.#items.push(new DiffItem(`${basePointer}/required`, 'major', `removed ${p}`));
        }

        if (schema1.type !== schema2.type) {
          this.#items.push(new DiffItem(`${basePointer}/type`, 'major', `changed`));
        }

        this.diffSchema(schema1.items, schema2.items, `${basePointer}/items`);

        const propNames1 = new Set<string>(schema1.properties.keys());
        const propNames2 = new Set<string>(schema2.properties.keys());
        const [addedProps, removedProps, stableProps] = diffStringSet(propNames1, propNames2);
        for (const p of addedProps) {
          this.#items.push(new DiffItem(`${basePointer}/properties/${p}`, 'minor', 'added'));
        }
        for (const p of removedProps) {
          this.#items.push(new DiffItem(`${basePointer}/properties/${p}`, 'major', 'removed'));
        }
        for (const p of stableProps) {
          const subschema1 = schema1.getPropertyOrThrow(p);
          const subschema2 = schema2.getPropertyOrThrow(p);
          this.diffSchema(subschema1, subschema2, `${basePointer}/properties/${p}`);
        }

        if (schema1.description !== schema2.description) {
          this.#items.push(new DiffItem(`${basePointer}/description`, 'patch', 'changed'));
        }
        if (schema1.format !== schema2.format) {
          this.#items.push(new DiffItem(`${basePointer}/format`, 'major', 'changed'));
        }
        if (schema1.default !== schema2.default) {
          this.#items.push(new DiffItem(`${basePointer}/default`, 'major', 'changed'));
        }
        if (schema1.nullable !== schema2.nullable) {
          this.#items.push(new DiffItem(`${basePointer}/nullable`, 'major', 'changed'));
        }
        if (schema1.readOnly !== schema2.readOnly) {
          this.#items.push(new DiffItem(`${basePointer}/readOnly`, 'patch', 'changed'));
        }
        if (schema1.writeOnly !== schema2.writeOnly) {
          this.#items.push(new DiffItem(`${basePointer}/writeOnly`, 'patch', 'changed'));
        }
        if (schema1.deprecated !== schema2.deprecated) {
          this.#items.push(new DiffItem(`${basePointer}/deprecated`, 'major', 'deprecated'));
        }
      } else {
        this.#items.push(new DiffItem(basePointer, 'major', 'added'));
      }
    } else if (schema1 != null) {
      this.#items.push(new DiffItem(basePointer, 'major', 'removed'));
    }
  }

  protected diffOperation(pathUrl: string, httpMethod: PathItemOperationKey): void {
    const operation1 = this.#model1.paths.getItemOrThrow(pathUrl).getOperationOrThrow(httpMethod);
    const operation2 = this.#model2.paths.getItemOrThrow(pathUrl).getOperationOrThrow(httpMethod);

    // tags
    const tags1 = new Set<string>(operation1.tags());
    const tags2 = new Set<string>(operation2.tags());
    const [added, removed] = diffStringSet(tags1, tags2);
    for (const t of added) {
      this.#items.push(new DiffItem(`#/paths${pathUrl}/${httpMethod}/tags`, 'patch', `added ${t}`));
    }
    for (const t of removed) {
      this.#items.push(
        new DiffItem(`#/paths${pathUrl}/${httpMethod}/tags`, 'patch', `removed ${t}`),
      );
    }

    if (operation1.summary !== operation2.summary) {
      this.#items.push(new DiffItem(`#/paths${pathUrl}/${httpMethod}/summary`, 'minor', `changed`));
    }
    if (operation1.description !== operation2.description) {
      this.#items.push(
        new DiffItem(`#/paths${pathUrl}/${httpMethod}/description`, 'patch', `changed`),
      );
    }

    // this.diffExternalDocs();

    if (operation1.operationId !== operation2.operationId) {
      this.#items.push(
        new DiffItem(`#/paths${pathUrl}/${httpMethod}/operationId`, 'major', `changed`),
      );
    }

    // parameters

    this.diffParameters(
      Array.from(operation1.parameters()),
      Array.from(operation2.parameters()),
      `#/paths${pathUrl}/${httpMethod}/`,
    );
    // this.diffRequestBody();
    // this.diffResponses();
    // this.diffCallbacks();

    if (operation1.deprecated !== operation2.deprecated) {
      this.#items.push(
        new DiffItem(`#/paths${pathUrl}/${httpMethod}/deprecated`, 'major', `changed`),
      );
    }
  }

  protected diffComponents(): void {
    const components1 = this.#model1.components;
    const components2 = this.#model2.components;

    // stable schemas (and other shared objects) should be compared inside other methods, like diffOperation

    this.diffKeys(components1.schemaKeys(), components2.schemaKeys(), '#/components/schemas');
    this.diffKeys(components1.responseKeys(), components2.responseKeys(), '#/components/responses');
    this.diffKeys(
      components1.parameterKeys(),
      components2.parameterKeys(),
      '#/components/parameters',
    );
    this.diffKeys(components1.exampleKeys(), components2.exampleKeys(), '#/components/examples');
    this.diffKeys(
      components1.requestBodyKeys(),
      components2.requestBodyKeys(),
      '#/components/requestBodies',
    );
    this.diffKeys(components1.headerKeys(), components2.headerKeys(), '#/components/headers');
    this.diffKeys(
      components1.securitySchemaKeys(),
      components2.securitySchemaKeys(),
      '#/components/securitySchemes',
    );
    this.diffKeys(components1.linkKeys(), components2.linkKeys(), '#/components/links');
    this.diffKeys(components1.callbackKeys(), components2.callbackKeys(), '#/components/callbacks');
  }

  protected diffKeys(
    keys1: IterableIterator<string>,
    keys2: IterableIterator<string>,
    basePointer: string,
  ): [Set<string>, Set<string>, Set<string>] {
    const keySet1 = new Set<string>(keys1);
    const keySet2 = new Set<string>(keys2);

    const [added, removed, stable] = diffStringSet(keySet1, keySet2);
    for (const k of added) {
      this.#items.push(new DiffItem(`${basePointer}/${k}`, 'minor', 'added'));
    }
    for (const k of removed) {
      this.#items.push(new DiffItem(`${basePointer}/${k}`, 'minor', 'removed'));
    }
    return [added, removed, stable];
  }

  protected diffMapKeys<V>(
    map1: ReadonlyMap<string, V>,
    map2: ReadonlyMap<string, V>,
    basePointer: string,
  ): [Set<string>, Set<string>, Set<string>] {
    const keys1 = new Set<string>(map1.keys());
    const keys2 = new Set<string>(map2.keys());

    const [added, removed, stable] = diffStringSet(keys1, keys2);
    for (const k of added) {
      this.#items.push(new DiffItem(`${basePointer}/${k}`, 'minor', 'added'));
    }
    for (const k of removed) {
      this.#items.push(new DiffItem(`${basePointer}/${k}`, 'minor', 'removed'));
    }
    return [added, removed, stable];
  }

  protected diffSecurityRequirements(): void {
    const aggregatedReqs1 = new Map<string, Set<string>>();
    const aggregatedReqs2 = new Map<string, Set<string>>();

    for (const req of this.#model1.securityRequirements()) {
      for (const schemeName of req.schemaNames()) {
        const aggregatedScopes = aggregatedReqs1.get(schemeName);
        if (aggregatedScopes) {
          for (const s of req.getScopes(schemeName)) {
            aggregatedScopes.add(s);
          }
        } else {
          aggregatedReqs1.set(schemeName, new Set<string>(req.getScopes(schemeName)));
        }
      }
    }

    for (const req of this.#model1.securityRequirements()) {
      for (const schemeName of req.schemaNames()) {
        const aggregatedScopes = aggregatedReqs2.get(schemeName);
        if (aggregatedScopes) {
          for (const s of req.getScopes(schemeName)) {
            aggregatedScopes.add(s);
          }
        } else {
          aggregatedReqs2.set(schemeName, new Set<string>(req.getScopes(schemeName)));
        }
      }
    }

    const [keysAdded, keysRemoved, keysStable] = diffMapKeys(aggregatedReqs1, aggregatedReqs2);
    for (const k of keysAdded) {
      this.#items.push(new DiffItem('#/security', 'minor', `added scheme ${k}`));
    }
    for (const k of keysRemoved) {
      this.#items.push(new DiffItem('#/security', 'minor', `removed scheme ${k}`));
    }
    for (const k of keysStable) {
      const [scopesAdded, scopesRemoved] = diffStringSet(
        aggregatedReqs1.get(k) as Set<string>,
        aggregatedReqs2.get(k) as Set<string>,
      );
      for (const s of scopesAdded) {
        this.#items.push(new DiffItem('#/security', 'minor', `added scope ${s} to scheme ${k}`));
      }
      for (const s of scopesRemoved) {
        this.#items.push(
          new DiffItem('#/security', 'minor', `removed scope ${s} from scheme ${k}`),
        );
      }
    }
  }

  protected diffTags(): void {
    const tags1ByName = new Map<string, [TagModel, number]>(
      Array.from(this.#model1.tags(), (t, i) => [t.name, [t, i]]),
    );
    const tags2ByName = new Map<string, [TagModel, number]>(
      Array.from(this.#model2.tags(), (t, i) => [t.name, [t, i]]),
    );

    const [addedTags, removedTags, stableTags] = diffMapKeys(tags1ByName, tags2ByName);
    for (const name of addedTags) {
      const entry2 = tags2ByName.get(name);
      assert(entry2);
      this.#items.push(new DiffItem(`#/tags/${entry2[1]}`, 'minor', 'added'));
    }
    for (const name of removedTags) {
      const entry2 = tags2ByName.get(name);
      assert(entry2);
      this.#items.push(new DiffItem(`#/tags/${entry2[1]}`, 'minor', 'removed'));
    }
    for (const name of stableTags) {
      const entry1 = tags1ByName.get(name);
      assert(entry1);
      const entry2 = tags2ByName.get(name);
      assert(entry2);
      this.diffTag(entry1[0], entry2[0], `#/tags/${entry2[1]}`);
    }
  }

  protected diffTag(tag1: TagModel, tag2: TagModel, basePointer: string): void {
    if (tag1.name !== tag2.name) {
      this.#items.push(new DiffItem(`${basePointer}/name`, 'minor', 'changed'));
    }
    if (tag1.description !== tag2.description) {
      this.#items.push(new DiffItem(`${basePointer}/description`, 'patch', 'changed'));
    }
    this.diffExternalDocs(tag1.externalDocs, tag2.externalDocs, '#/');
  }

  protected diffExternalDocs(
    docs1: Nullable<ExternalDocumentationModel>,
    docs2: Nullable<ExternalDocumentationModel>,
    basePointer: string,
  ): void {
    if (docs2 != null) {
      if (docs1 != null) {
        if (docs1.url !== docs2.url) {
          this.#items.push(new DiffItem(`${basePointer}/url`, 'patch', 'changed'));
        }
        if (docs1.description !== docs2.description) {
          this.#items.push(new DiffItem(`${basePointer}/description`, 'patch', 'changed'));
        }
      } else {
        this.#items.push(new DiffItem(basePointer, 'patch', 'added'));
      }
    } else if (docs1 != null) {
      this.#items.push(new DiffItem(basePointer, 'patch', 'removed'));
    }
  }

  protected calculateNewVersion(): void {
    const severities = new Set<Severity>();
    for (const item of this.#items) {
      severities.add(item.severity);
    }

    let [major, minor, patch] = this.#model2.info.version.split('.');

    if (severities.has('major')) {
      major = `${Number(major) + 1}`;
    } else if (severities.has('minor')) {
      minor = `${Number(minor) + 1}`;
    } else if (severities.has('patch')) {
      patch = `${Number(patch) + 1}`;
    }

    this.#outdatedVersion = severities.size > 0;
    this.#newVersion = `${major}.${minor}.${patch}`;
  }

  print(): void {
    for (const item of this.#items) {
      let prefix: string;
      switch (item.severity) {
        case 'major':
          prefix = chalk.red(item.severity);
          break;
        case 'minor':
          prefix = chalk.magenta(item.severity);
          break;
        case 'patch':
          prefix = chalk.yellow(item.severity);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          assert.fail(`Unsupported severity ${item.severity}`);
      }

      console.log(`[${prefix}] ${item.pointer} ${item.message}`);
    }
  }

  get outdatedVersion(): boolean {
    return this.#outdatedVersion;
  }

  get newVersion(): string {
    return this.#newVersion;
  }
}
