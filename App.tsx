
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
  const [isExecutingAll, setIsExecutingAll] = useState(false);

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

  const clearOutputs = () => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => ({ ...c, output: undefined, executionCount: undefined }))
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

  const runAll = async () => {
    setIsExecutingAll(true);
    for (const cell of notebook.cells) {
      if (cell.type === CellType.CODE) {
        await executeCell(cell.id);
      }
    }
    setIsExecutingAll(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100">
      <main className="max-w-4xl mx-auto py-16 px-6">
        <Notebook 
          cells={notebook.cells} 
          onUpdateCell={updateCell}
          onDeleteCell={deleteCell}
          onExecuteCell={executeCell}
          onAddCell={addCell}
        />

        {/* Global Controls */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => addCell(CellType.CODE)}
              className="px-8 py-2.5 border-2 border-green-500 rounded text-black font-bold text-sm uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all"
            >
              + Code Cell
            </button>
            <button 
              onClick={() => addCell(CellType.MARKDOWN)}
              className="px-8 py-2.5 border-2 border-green-500 rounded text-black font-bold text-sm uppercase tracking-wider hover:bg-slate-50 active:scale-95 transition-all"
            >
              + Text Cell
            </button>
          </div>
          
          <div className="flex items-center gap-6 border-t border-slate-100 pt-8 w-full justify-center">
            <button 
              onClick={runAll}
              disabled={isExecutingAll}
              className="text-black font-bold text-xs uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              Run All Cells
            </button>
            <button 
              onClick={clearOutputs}
              className="text-black font-bold text-xs uppercase tracking-widest hover:underline"
            >
              Clear All Outputs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
