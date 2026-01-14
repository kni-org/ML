
export enum CellType {
  CODE = 'CODE',
  MARKDOWN = 'MARKDOWN'
}

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  isExecuting?: boolean;
  executionCount?: number;
  executionTime?: number; // In seconds
}

export interface NotebookState {
  id: string;
  title: string;
  cells: Cell[];
  lastModified: number;
}