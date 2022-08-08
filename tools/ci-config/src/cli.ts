import console from 'console';
import fs from 'fs';
import path from 'path';

import glob from 'glob';
import yaml from 'yaml';

type PackageJson = {
  name: string;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
};

type WorkspacePackageJson = {
  workspaces: {
    packages: string[];
  };
};

const computeLocalPackageDependencies = (monorepoRootDir: string): Map<string, Set<string>> => {
  const packageDeps = new Map<string, Set<string>>();
  const monorepoPackageJsonPath = path.join(monorepoRootDir, 'package.json');
  const monorepoPackageJson = JSON.parse(
    fs.readFileSync(monorepoPackageJsonPath, 'utf-8'),
  ) as WorkspacePackageJson;
  for (const globStr of monorepoPackageJson.workspaces.packages) {
    for (const globItem of glob.sync(globStr, { cwd: monorepoRootDir })) {
      const packageJsonPath = path.join(monorepoRootDir, globItem, 'package.json');
      if (fs.statSync(packageJsonPath, { throwIfNoEntry: false })?.isFile()) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
        let deps = packageDeps.get(packageJson.name);
        if (!deps) {
          deps = new Set<string>();
          packageDeps.set(packageJson.name, deps);
        }
        if (packageJson.dependencies) {
          for (const dep of Object.keys(packageJson.dependencies)) {
            deps.add(dep);
          }
        }
        if (packageJson.devDependencies) {
          for (const dep of Object.keys(packageJson.devDependencies)) {
            deps.add(dep);
          }
        }
      }
    }
  }
  const localPackages = new Set<string>(packageDeps.keys());
  for (const deps of packageDeps.values()) {
    const toRemove = new Set<string>();
    for (const dep of deps) {
      if (!localPackages.has(dep)) {
        toRemove.add(dep);
      }
    }
    for (const dep of toRemove) {
      deps.delete(dep);
    }
  }
  return packageDeps;
};

const sortDependenciesFirst = function* sortDependenciesFirst(
  key: string,
  packageDeps: Map<string, Set<string>>,
  visited: Set<string>,
): IterableIterator<string> {
  const deps = packageDeps.get(key);
  if (deps?.size) {
    for (const dep of deps) {
      for (const depdep of sortDependenciesFirst(dep, packageDeps, visited)) {
        yield depdep;
      }
    }
  }
  if (!visited.has(key)) {
    visited.add(key);
    yield key;
  }
};

const buildConfig = (packageDeps: Map<string, Set<string>>): unknown => {
  const result = {
    version: '2.1',
    orbs: {
      node: 'circleci/node@5.0.2',
    },
    jobs: {
      'check-pr': {
        docker: [{ image: 'cimg/base:stable' }],
        steps: [
          'checkout',
          {
            'node/install': {
              'install-yarn': false,
              'node-version': '16.14',
            },
          },
          { run: 'npm install' },
          { run: 'npm run check' },
        ],
      },
    },
    workflows: {
      'node-tests': {
        jobs: ['check-pr'],
      },
    },
  };

  const visited = new Set<string>();
  for (const name of packageDeps.keys()) {
    for (const localPackage of sortDependenciesFirst(name, packageDeps, visited)) {
      result.jobs['check-pr'].steps.splice(-2, 0, {
        run: `npm run -w ${localPackage} --if-present build && exit 0`,
      });
    }
  }

  return result;
};

const main = (): void => {
  try {
    const monorepoRootDir = path.join(__dirname, '..', '..', '..');
    const packageDeps = computeLocalPackageDependencies(monorepoRootDir);
    const result = buildConfig(packageDeps);
    const text = yaml.stringify(result);
    const outputPath = path.join(monorepoRootDir, '.circleci', 'config.yml');
    fs.writeFileSync(outputPath, text, 'utf-8');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
