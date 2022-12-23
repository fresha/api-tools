import { snakeCase } from '@fresha/api-tools-core';

import type { Context } from './types';
import type { SourceFile } from '@fresha/code-morph-ex';
import type { ResourceModel } from '@fresha/json-api-model';

export class Resource {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;
  readonly resource: ResourceModel;

  constructor(context: Context, moduleName: string, resource: ResourceModel) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createResourceFile(moduleName);
    this.resource = resource;
  }

  collectData(): void {
    this.context.logger.info(`Generating code for resource ${this.moduleName}`);
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for resource ${this.moduleName}`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeModuleAttr('resource_type', this.resource.type);
      this.sourceFile.writeUse('Jabbax.Document');
      this.maybeWriteBuildFunction();
      this.writeLinkFunction();
      this.maybeWriteLinkRelationshipsFunctions();
    });
  }

  protected maybeWriteBuildFunction(): void {
    if (this.resource.jsonSchema()) {
      for (const { otherResourceType } of this.resource.relationships.values()) {
        this.sourceFile.writeAlias(this.context.project.getResourceModuleName(otherResourceType));
      }
      this.sourceFile.writeFunction({
        name: 'build',
        params: ['config'],
        content: () => {
          this.sourceFile.writeStruct('Resource', () => {
            this.sourceFile.writePropertyAssignment('type', '@resource_type');
            this.sourceFile.writePropertyAssignment('id', 'config.id');
            this.sourceFile.writePropertyStruct('attributes', () => {
              for (const propName of this.resource.attributes.keys()) {
                const elixirPropName = snakeCase(propName);
                this.sourceFile.writeLine(`${elixirPropName}: config.${elixirPropName},`);
              }
            });

            if (this.resource.relationships.size) {
              this.sourceFile.writeLine('relationships:');
              this.sourceFile.writeIndented(() => {
                this.sourceFile.writeLine('%{}');
                for (const relName of this.resource.relationships.keys()) {
                  const elixirRelName = snakeCase(relName);
                  this.sourceFile.writeLine(
                    `|> link_relationship(:${elixirRelName}, config.${elixirRelName})`,
                  );
                }
              });
            }
          });
        },
      });
    }
  }

  protected maybeWriteLinkRelationshipsFunctions(): void {
    if (this.resource.relationships.size) {
      this.sourceFile.writeFunction({
        isPrivate: true,
        name: 'link_relationship',
        params: ['relationships', 'type', 'nil'],
        content: () => {
          this.sourceFile.writeLine(
            'Map.put(relationships, type, %Jabbax.Document.Relationship{data: nil})',
          );
        },
      });

      for (const [relName, { otherResourceType }] of this.resource.relationships) {
        const elixirRelName = snakeCase(relName);
        const moduleAlias = this.context.project.getResourceModuleAlias(otherResourceType);

        this.sourceFile.writeFunction({
          isPrivate: true,
          name: 'link_relationship',
          params: ['relationships', `:${elixirRelName}`, elixirRelName],
          content: () => {
            this.sourceFile.writeLine(
              `Map.put(relationships, :${elixirRelName}, ${moduleAlias}.link(${elixirRelName}))`,
            );
          },
        });
      }
    }
  }

  protected writeLinkFunction(): void {
    this.sourceFile.writeFunction({
      name: 'link',
      params: ['config'],
      content: () =>
        this.sourceFile.writeStruct('ResourceId', { type: '@resource_type', id: 'config.id' }),
    });
  }
}
