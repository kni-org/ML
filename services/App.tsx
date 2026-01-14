
import React, { useState } from 'react';
import { Notebook } from './components/Notebook';
import { Cell, CellType, NotebookState } from './types';
import { kernel } from './services/geminiService';

const INITIAL_NOTEBOOK: NotebookState = {
  id: 'notebook-main',
  title: '',
  lastModified: Date.now(),
  cells: [
    {
      id: 'welcome-cell',
      type: CellType.CODE,
      content: 'print("WELCOME TO KNI-ORGANISATION !")',
      executionCount: 1,
      output: 'WELCOME TO KNI-ORGANISATION !'
    }
  ]
};

const App: React.FC = () => {
  const [notebook, setNotebook] = useState<NotebookState>(INITIAL_NOTEBOOK);

  const addCell = (type: CellType, afterId?: string) => {
    const newCell: Cell = {
      id: `cell-${Math.random().toString(36).substr(2, 9)}`,
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

    const context = notebook.cells
      .slice(0, notebook.cells.findIndex(c => c.id === id))
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
    <div className="min-h-screen bg-white">
      <main className="pt-12 pb-40 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          {/* Action buttons with bright black text and green accents */}
          <div className="mb-12 flex items-center justify-center gap-6">
            <button 
              onClick={() => addCell(CellType.CODE)}
              className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-green-500 rounded-lg text-[14px] font-black text-[#000000] hover:bg-green-500 hover:text-white shadow-lg shadow-green-100 transition-all active:scale-95"
            >
              <span className="text-xl">+</span> 
              CODE
            </button>
            <button 
              onClick={() => addCell(CellType.MARKDOWN)}
              className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-emerald-500 rounded-lg text-[14px] font-black text-[#000000] hover:bg-emerald-500 hover:text-white shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              <span className="text-xl">+</span> 
              TEXT
            </button>
          </div>

          <Notebook 
            cells={notebook.cells} 
            onUpdateCell={updateCell}
            onDeleteCell={deleteCell}
            onExecuteCell={executeCell}
            onAddCell={addCell}
          />

          {notebook.cells.length === 0 && (
            <div className="text-center py-20 bg-emerald-50/20 rounded-2xl border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-emerald-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <p className="text-emerald-400 font-medium">Notebook is empty. Click "+ CODE" to start learning.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
