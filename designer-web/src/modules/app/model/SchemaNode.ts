import { IFolderNode, ILeafNode } from "./types";

export class SchemaNode implements ILeafNode {
  parent: IFolderNode;
  name: string;

  constructor(parent: IFolderNode, name: string) {
    this.parent = parent;
    this.name = name;
  }
}
