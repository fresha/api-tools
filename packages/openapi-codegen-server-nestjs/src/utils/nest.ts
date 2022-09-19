import assert from 'assert';
import fs from 'fs';
import path from 'path';

type NestCliJSON = {
  sourceRoot: string;
  projects?: Record<
    string,
    {
      sourceRoot: string;
    }
  >;
};

/**
 * For given directory of a NestJS application, and name of a sub-app therein, returns
 * the root folder for that sub-app. The information is read from nest-cli.json file.
 */
export const getNestJSSubAppPath = (packageDir: string, appName?: string): string => {
  const filePath = path.join(packageDir, 'nest-cli.json');
  assert(fs.existsSync(filePath), `${packageDir} does not seem to be a NestJS application`);

  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as NestCliJSON;

  if (appName) {
    assert(json.projects);
    const result = json.projects[appName]?.sourceRoot;
    assert(
      !!result,
      `Cannot determine source root of "${appName}" app in ${packageDir}/nest-cli.json`,
    );

    return path.join(packageDir, result);
  }

  const result = json.sourceRoot;
  assert(!!result, `Cannot determine source root in ${packageDir}/nest-cli.json`);

  return path.join(packageDir, result);
};
