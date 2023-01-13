import { snakeCase } from '@fresha/api-tools-core';

import type { Context } from '../context';
import type { SourceFile } from '@fresha/code-morph-ex';
import type { JSONAPIResourceSchema } from '@fresha/json-api-model';

export class Resource {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;
  readonly resource: JSONAPIResourceSchema;

  constructor(context: Context, moduleName: string, resource: JSONAPIResourceSchema) {
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
    if (this.resource.schema) {
      for (const { resourceType } of this.resource.relationshipSchemas()) {
        this.sourceFile.writeAlias(this.context.project.getResourceModuleName(resourceType));
      }
      this.sourceFile.writeFunction({
        name: 'build',
        params: ['config'],
        content: () => {
          this.sourceFile.writeStruct('Resource', () => {
            this.sourceFile.writePropertyAssignment('type', '@resource_type');
            this.sourceFile.writePropertyAssignment('id', 'config.id');
            this.sourceFile.writePropertyStruct('attributes', () => {
              for (const propName of this.resource.getAttributeNames()) {
                const elixirPropName = snakeCase(propName);
                this.sourceFile.writeLine(`${elixirPropName}: config.${elixirPropName},`);
              }
            });

            if (this.resource.hasRelationships()) {
              this.sourceFile.writeLine('relationships:');
              this.sourceFile.writeIndented(() => {
                this.sourceFile.writeLine('%{}');
                for (const relName of this.resource.getRelationshipNames()) {
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
    if (this.resource.hasRelationships()) {
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

      for (const relObj of this.resource.relationshipSchemas()) {
        const elixirRelName = snakeCase(relObj.name);
        const moduleAlias = this.context.project.getResourceModuleAlias(relObj.resourceType);

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
