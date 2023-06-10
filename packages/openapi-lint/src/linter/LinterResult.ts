import type { Issue, Result } from '../types';

export class LinterResult implements Result {
  #maxWarnings: number;
  #issues: Issue[];
  #errorCount: number;
  #warningCount: number;

  constructor(maxWarnings: number) {
    this.#maxWarnings = maxWarnings;
    this.#issues = [];
    this.#errorCount = 0;
    this.#warningCount = 0;
  }

  get isFailure(): boolean {
    return (
      this.#errorCount > 0 || (this.#maxWarnings >= 0 && this.#warningCount > this.#maxWarnings)
    );
  }

  get issueCount(): number {
    return this.#issues.length;
  }

  issues(): IterableIterator<Issue> {
    return this.#issues.values();
  }

  addIssue(issue: Issue): void {
    this.#issues.push(issue);
    if (issue.severity === 'error') {
      this.#errorCount += 1;
    } else {
      this.#warningCount += 1;
    }
  }
}
