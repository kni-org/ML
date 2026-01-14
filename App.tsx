
import React, { useState } from 'react';
import { Notebook } from './components/Notebook';
import { Cell, CellType, NotebookState } from './types';
import { kernel } from './services/geminiService';

const INITIAL_NOTEBOOK: NotebookState = {
  id: 'notebook-main',
  title: 'Notebook',
  lastModified: Date.now(),
  cells: [
    {
      id: 'cell-initial',
      type: CellType.CODE,
      content: 'print("Hello World")',
      executionCount: 1,
      output: 'Hello World',
    }
  ]
};

const App: React.FC = () => {
  const [notebook, setNotebook] = useState<NotebookState>(INITIAL_NOTEBOOK);

  const addCell = (type: CellType, afterId?: string) => {
    const newCell: Cell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content: '',
    };
    setNotebook(prev => {
      const index = afterId ? prev.cells.findIndex(c => c.id === afterId) : prev.cells.length - 1;
      const newCells = [...prev.cells];
      newCells.splice(index + 1, 0, newCell);
      return { ...prev, cells: newCells };
    });
  };

  const updateCell = (id: string, content: string) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, content } : c)
    }));
  };

  const deleteCell = (id: string) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.filter(c => c.id !== id)
    }));
  };

  const executeCell = async (id: string) => {
    const cell = notebook.cells.find(c => c.id === id);
    if (!cell || cell.type !== CellType.CODE) return;

    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => c.id === id ? { ...c, isExecuting: true } : c)
    }));

    const cellIndex = notebook.cells.findIndex(c => c.id === id);
    const context = notebook.cells
      .slice(0, cellIndex)
      .filter(c => c.type === CellType.CODE)
      .map(c => c.content)
      .join('\n\n');

    const result = await kernel.executeCode(cell.content, context);

    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => 
        c.id === id 
          ? { 
              ...c, 
              output: result, 
              isExecuting: false, 
              executionCount: (c.executionCount || 0) + 1 
            } 
          : c
      )
    }));
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <main className="max-w-4xl mx-auto py-12 px-6">
        <Notebook 
          cells={notebook.cells} 
          onUpdateCell={updateCell}
          onDeleteCell={deleteCell}
          onExecuteCell={executeCell}
          onAddCell={addCell}
        />

        <div className="mt-12 flex items-center justify-center gap-4">
          <button 
            onClick={() => addCell(CellType.CODE)}
            className="px-6 py-2 border-2 border-green-500 rounded text-black font-bold hover:bg-slate-50 transition-colors"
          >
            + CODE
          </button>
          <button 
            onClick={() => addCell(CellType.MARKDOWN)}
            className="px-6 py-2 border-2 border-green-500 rounded text-black font-bold hover:bg-slate-50 transition-colors"
          >
            + TEXT
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
