import { Project } from './Project';

export class SourceFile {
  readonly project: Project;
  readonly filePath: string;
  protected text: string;

  constructor(project: Project, filePath: string, text?: string) {
    this.project = project;
    this.filePath = filePath;
    this.text = text ?? '';
  }

  getFilePath(): string {
    return this.filePath;
  }

  getText(): string {
    return this.text;
  }

  saveSync(): void {
    this.project.getFS().writeFileSync(this.filePath, this.text, 'utf-8');
  }
}
