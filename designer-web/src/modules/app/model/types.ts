export interface IWorkspaceNode {
  parent: IFolderNode | null;
  name: string;
}

export interface ILeafNode extends IWorkspaceNode {
}

export interface IFolderNode extends IWorkspaceNode {
  readonly subfolders: IFolderNode[];
  readonly items: ILeafNode[];
}

export interface IWorkspace {
  readonly rootFolder: IFolderNode;
}
