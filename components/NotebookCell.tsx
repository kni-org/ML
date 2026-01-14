
import React, { useState, useRef, useEffect } from 'react';
import { Cell, CellType } from '../types';

interface NotebookCellProps {
  cell: Cell;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onExecute: () => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({ cell, onUpdate, onDelete, onExecute }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCode = cell.type === CellType.CODE;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [cell.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
      e.preventDefault();
      if (isCode) onExecute();
    }
  };

  return (
    <div 
      className={`relative w-full border-2 border-green-500 rounded-lg mb-6 bg-white overflow-hidden ${isFocused ? 'shadow-lg' : ''}`}
    >
      <div className="flex flex-col">
        {/* Cell Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-green-100">
           <div className="flex items-center gap-3">
             {isCode && (
               <button 
                onClick={onExecute}
                disabled={cell.isExecuting}
                className="text-black font-bold text-sm px-3 py-1 border border-black rounded hover:bg-slate-50 disabled:opacity-50"
               >
                {cell.isExecuting ? 'Running...' : 'Run'}
               </button>
             )}
             <span className="text-xs text-slate-400 font-mono">
               {isCode ? (cell.executionCount ? `[${cell.executionCount}]` : '[ ]') : 'Text'}
             </span>
           </div>
           <button 
            onClick={onDelete}
            className="text-black font-bold text-xs px-2 py-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
           >
            Delete
           </button>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={cell.content}
            onChange={(e) => onUpdate(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={isCode ? "Enter code..." : "Enter text..."}
            className={`w-full resize-none outline-none border-none p-0 font-mono text-[14px] leading-relaxed bg-white ${
              isCode ? 'text-blue-600' : 'text-black'
            }`}
          />
        </div>

        {/* Output Section */}
        {isCode && cell.output && (
          <div className="border-t border-green-100 bg-white p-4">
            <pre className="font-mono text-[13px] text-black whitespace-pre-wrap">
              {cell.output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
