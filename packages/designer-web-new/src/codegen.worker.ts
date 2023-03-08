import { Project } from "ts-morph";

export const generate = async () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('index.ts', '', { overwrite: true });

  sourceFile.addClass({
    name: 'SomeClass',
  });

  return sourceFile.getText();
};
