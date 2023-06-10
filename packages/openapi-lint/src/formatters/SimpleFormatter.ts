import console from 'console';

import chalk from 'chalk';

import type { Severity, Formatter, Issue, Result } from '../types';

export class SimpleFormatter implements Formatter {
  // eslint-disable-next-line class-methods-use-this
  format(result: Result): void {
    const issuesPerFile = new Map<string, Issue[]>();
    const severityCount = new Map<Severity, number>();

    for (const issue of result.issues()) {
      issuesPerFile.set(issue.file, [...(issuesPerFile.get(issue.file) ?? []), issue]);
      severityCount.set(issue.severity, (severityCount.get(issue.severity) ?? 0) + 1);
    }

    const fileNames = Array.from(issuesPerFile.keys()).sort();
    for (const fileName of fileNames) {
      console.log(fileName);
      for (const item of issuesPerFile.get(fileName)!) {
        let str = '  ';
        if (item.severity === 'error') {
          str += chalk.red('[error] ');
        } else if (item.severity === 'warning') {
          str += chalk.yellow('[warn] ');
        }
        str += item.message;
        console.log(str);
      }
    }
    if (result.issueCount > 0) {
      let str = 'Summary: ';
      const errorCount = severityCount.get('error') ?? 0;
      if (errorCount > 0) {
        str += chalk.red(`${errorCount} errors`);
      }
      const warningCount = severityCount.get('warning') ?? 0;
      if (warningCount > 0) {
        str += chalk.red(`${warningCount} warnings`);
      }
      console.log(str);
    }
  }
}
