import path from 'path';

import type { Project } from './Project';

export class SourceFile {
  protected readonly project: Project;
  protected readonly filePath: string;
  protected text: string;
  protected dirty: boolean;

  protected indentLevel: number;
  protected indentStr: string;

  constructor(project: Project, filePath: string, text?: string) {
    this.project = project;
    this.filePath = filePath;
    this.text = text ?? '';
    this.dirty = true;

    this.indentLevel = 0;
    this.indentStr = '';
  }

  getProject(): Project {
    return this.project;
  }

  getFilePath(): string {
    return this.filePath;
  }

  getText(): string {
    return this.text;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  saveSync(): void {
    if (this.dirty) {
      const fs = this.project.getFS();
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, this.text, 'utf-8');
      this.dirty = false;
    }
  }

  // code writing methods

  writeLine(line: string): void {
    if (this.text) {
      this.text += `\n${this.indentStr}${line}`;
    } else {
      this.text += `${this.indentStr}${line}`;
    }
    this.dirty = true;
  }

  writeLines(...lines: string[]): void {
    for (const line of lines) {
      this.writeLine(line);
    }
  }

  newLine(): void {
    this.text += '\n';
    this.dirty = true;
  }

  indentBy(delta: number): void {
    this.indentLevel += delta;
    this.indentStr = ''.padStart(this.indentLevel * 2, ' ');
  }

  writeIndented(fn: () => void, delta = 1): void {
    this.indentBy(delta);
    fn();
    this.indentBy(-delta);
  }

  writeIndentedLines(...lines: string[]): void {
    this.writeIndented(() => this.writeLines(...lines), 1);
  }

  writeDefmodule(name: string, writeContent: () => void): void {
    this.writeLine(`defmodule ${name} do`);
    this.writeIndented(() => {
      this.writeLine('@moduledoc false');
      this.newLine();
      writeContent();
    });
    this.writeLine('end');
  }

  writeModuleAttr(name: string, initializer: string): void {
    this.writeLine(`@${name} "${initializer}"`);
  }

  writeUse(name: string, ...params: string[]): void {
    this.writeLine(`use ${name}${params.length ? ', ' : ''}${params.join(', ')}`);
  }

  writeAlias(name: string): void {
    this.writeLine(`alias ${name}`);
  }

  writeAliases(...names: string[]): void {
    for (const name of names) {
      this.writeAlias(name);
    }
  }

  writeImport(name: string): void {
    this.writeLine(`import ${name}`);
  }

  writeFunction({
    name,
    params,
    guards,
    content,
    isPrivate,
  }: {
    name: string;
    params?: string[];
    guards?: string[];
    content: () => void;
    isPrivate?: boolean;
  }): void {
    const chunks = [isPrivate ? 'defp ' : 'def ', name];
    if (params?.length) {
      chunks.push('(');
      for (const p of params) {
        chunks.push(p, ', ');
      }
      chunks.splice(-1, 1, ')');
    }
    if (guards?.length) {
      chunks.push(' when');
      for (const g of guards) {
        chunks.push(' ', g);
      }
    }
    chunks.push(' do');

    this.newLine();
    this.writeLine(chunks.join(''));
    this.writeIndented(content);
    this.writeLine('end');
  }

  writeFunctionCall(name: string, ...params: string[]): void {
    switch (params.length) {
      case 0:
        this.writeLine(`${name}()`);
        break;
      case 1:
        this.writeLine(`${name}(${params[0]})`);
        break;
      default: {
        this.writeLine(`${name}(`);
        this.writeIndentedLines(...params.map(p => `${p},`));
        this.writeLine(')');
      }
    }
  }

  writeWith(clauses: string[], ifContentWriter: () => void, elseContentWriter?: () => void): void {
    if (clauses.length > 1) {
      this.writeLine(`with ${clauses[0]},`);
      for (let i = 1; i < clauses.length - 1; i += 1) {
        this.writeLine(`     ${clauses[i]},`);
      }
      this.writeLine(`     ${clauses.at(-1)!} do`);
    } else {
      this.writeLine(`with ${clauses[0]} do`);
    }

    this.writeIndented(ifContentWriter);

    if (elseContentWriter) {
      this.writeLine('else');
      this.writeIndented(elseContentWriter);
      this.writeLine('end');
    }
  }

  writeMapping(from: string, to: string): void {
    this.writeLine(`${from} ->`);
    this.writeIndentedLines(to);
  }

  writeMappings(vals: Record<string, string>): void {
    const entries = Object.entries(vals);
    for (let i = 0; i < entries.length; i += 1) {
      if (i > 0) {
        this.newLine();
      }
      this.writeMapping(entries[i][0], entries[i][1]);
    }
  }

  writeStruct(name: string, content: Record<string, string> | (() => void)): void {
    this.writeLine(`%${name}{`);
    this.writeIndented(
      typeof content === 'function'
        ? content
        : () => {
            for (const [propName, propInitializer] of Object.entries(content)) {
              this.writePropertyAssignment(propName, propInitializer);
            }
          },
    );
    this.writeLine('}');
  }

  writePropertyAssignment(name: string, initializer: string): void {
    this.writeLine(`${name}: ${initializer},`);
  }

  writePropertyStruct(name: string, contentWriter: () => void): void {
    this.writeLine(`${name}: %{`);
    this.writeIndented(contentWriter);
    this.writeLine('},');
  }
}
