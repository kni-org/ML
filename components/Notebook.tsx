
import React from 'react';
import { Cell, CellType } from '../types';
import { NotebookCell } from './NotebookCell';

interface NotebookProps {
  cells: Cell[];
  onUpdateCell: (id: string, content: string) => void;
  onDeleteCell: (id: string) => void;
  onExecuteCell: (id: string) => void;
  onAddCell: (type: CellType, afterId?: string) => void;
}

export const Notebook: React.FC<NotebookProps> = ({ 
  cells, 
  onUpdateCell, 
  onDeleteCell, 
  onExecuteCell,
  onAddCell
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {cells.map((cell, index) => (
        <NotebookCell 
          key={cell.id}
          cell={cell}
          onUpdate={(content) => onUpdateCell(cell.id, content)}
          onDelete={() => onDeleteCell(cell.id)}
          onExecute={() => onExecuteCell(cell.id)}
        />
      ))}
    </div>
  );
};
