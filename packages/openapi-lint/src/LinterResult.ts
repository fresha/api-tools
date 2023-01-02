import chalk from 'chalk';

export class LinterResult {
  #currentFile?: string;
  #fileItems: Map<string, string[]>;
  #errorCount: number;
  #warningCount: number;

  constructor() {
    this.#currentFile = undefined;
    this.#fileItems = new Map<string, string[]>();
    this.#errorCount = 0;
    this.#warningCount = 0;
  }

  setCurrentFile(filePath?: string): void {
    this.#currentFile = filePath;
  }

  protected addItem(item: string): void {
    const key = this.#currentFile ?? 'unknown';
    let items = this.#fileItems.get(key);
    if (!items) {
      items = [];
      this.#fileItems.set(key, items);
    }
    items.push(item);
  }

  addError(message: string): void {
    this.addItem(`${chalk.red('[error]')} ${message}`);
    this.#errorCount += 1;
  }

  addWarning(message: string): void {
    this.addItem(`${chalk.yellow('[warn] ')} ${message}`);
    this.#warningCount += 1;
  }

  print(): void {
    const fileNames = Array.from(this.#fileItems.keys()).sort();
    for (const fileName of fileNames) {
      global.console.log(fileName);
      for (const item of this.#fileItems.get(fileName)!) {
        global.console.log(`  ${item}`);
      }
    }
    if (this.#errorCount + this.#warningCount > 0) {
      global.console.log(
        `Summary: ${chalk.red(`${this.#errorCount} errors`)}, ${chalk.yellow(
          `${this.#warningCount} warnings`,
        )}`,
      );
    }
  }
}
