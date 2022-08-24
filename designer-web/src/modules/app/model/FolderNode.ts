import type { IFolderNode, ILeafNode } from "./types";

export class FolderNode implements IFolderNode {
  readonly parent: IFolderNode | null;
  readonly subfolders: IFolderNode[];
  readonly items: ILeafNode[];
  readonly name: string;

  constructor(parent: IFolderNode | null, name: string) {
    this.parent = parent;
    this.subfolders = [];
    this.items = [];
    this.name = name;
  }
}
