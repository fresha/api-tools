import { FolderNode } from "./FolderNode";
import type { IFolderNode, IWorkspace } from "./types";

export class Workspace implements IWorkspace {
  rootFolder: IFolderNode;

  constructor() {
    this.rootFolder = new FolderNode(null, '');
  }
}
