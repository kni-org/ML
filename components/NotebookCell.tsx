
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

  const lineCount = cell.content.split('\n').length || 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div 
      className={`relative w-full border-2 transition-all duration-200 rounded-lg mb-6 bg-white flex flex-col ${
        isFocused ? 'border-green-600 shadow-sm' : 'border-green-500'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-green-100 bg-white">
        <div className="flex items-center gap-4">
          {isCode && (
            <button 
              onClick={onExecute}
              disabled={cell.isExecuting}
              className="text-black font-black text-[11px] uppercase tracking-tighter hover:underline disabled:opacity-50"
            >
              {cell.isExecuting ? 'Running' : 'Run Cell'}
            </button>
          )}
          <span className="text-[10px] font-mono text-slate-400">
            {isCode ? `In [${cell.executionCount || ' '}]` : 'Markdown'}
          </span>
        </div>
        <button 
          onClick={onDelete}
          className="text-black font-black text-[11px] uppercase tracking-tighter hover:text-red-600"
        >
          Remove
        </button>
      </div>

      <div className="flex items-start">
        {/* Line Number Gutter */}
        {isCode && (
          <div className="w-10 pt-4 flex flex-col items-center select-none border-r border-green-50 bg-slate-50/20">
            {lineNumbers.map(n => (
              <span key={n} className="text-[11px] font-mono text-slate-300 leading-relaxed h-[1.625rem]">{n}</span>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-1 p-4 pt-4">
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
            placeholder={isCode ? "Enter Python code..." : "Enter text here..."}
            className={`w-full resize-none outline-none border-none p-0 font-mono text-[14px] leading-relaxed bg-white ${
              isCode ? 'text-[#0000FF]' : 'text-black font-sans'
            }`}
          />
        </div>
      </div>

      {/* Output Section */}
      {isCode && cell.output && (
        <div className="border-t border-green-100 bg-white p-5 pt-4">
          <div className="text-[10px] font-mono text-slate-300 mb-2">Out [{cell.executionCount}]</div>
          <pre className="font-mono text-[13.5px] text-black whitespace-pre-wrap leading-relaxed">
            {cell.output}
          </pre>
        </div>
      )}
    </div>
  );
};
