
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

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [cell.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey)) {
      e.preventDefault();
      onExecute();
    }
  };

  const lineCount = cell.content.split('\n').length || 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div 
      className={`cell-transition group relative bg-white border-2 ${
        isFocused 
          ? 'border-emerald-500 shadow-lg shadow-emerald-50' 
          : 'border-emerald-100 hover:border-emerald-200'
      } rounded-xl mb-6 overflow-hidden ${isFocused ? 'z-20' : 'z-10'}`}
    >
      <div className="flex flex-col">
        
        {/* Cell Actions */}
        <div className={`absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-30`}>
          <button 
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete Cell"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Editor Area */}
        <div className={`flex items-start p-4 ${isCode ? 'bg-[#fcfdfd]' : 'bg-white'}`}>
          
          {/* Gutter / Run Button */}
          <div className="w-12 flex flex-col items-center pt-1 shrink-0 select-none">
            {isCode ? (
              <button 
                onClick={onExecute}
                disabled={cell.isExecuting}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${
                  cell.isExecuting 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                }`}
              >
                {cell.isExecuting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7v5h5v11H6V4z"/></svg>
              </div>
            )}
            {isCode && cell.executionCount && (
              <span className="text-[10px] font-mono font-bold text-emerald-500 mt-2">[{cell.executionCount}]</span>
            )}
          </div>

          {/* Text Input */}
          <div className="flex-1 flex min-w-0 ml-2">
            {isCode && (
              <div className="font-mono leading-[1.6] select-none text-slate-300 pr-4 text-[13.5px]">
                {lineNumbers.map(n => <div key={n}>{n}</div>)}
              </div>
            )}
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
              placeholder={isCode ? "print('Hello ML Platform')..." : "Type something..."}
              className={`w-full resize-none outline-none border-none p-0 m-0 font-mono text-[13.5px] leading-[1.6] transition-colors ${
                isCode ? 'code-input' : 'text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Execution Output */}
        {cell.output && isCode && (
          <div className="border-t border-emerald-50 bg-[#fafafa] p-6 ml-14">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">Output</span>
            </div>
            <pre className={`mono text-[13px] whitespace-pre-wrap leading-relaxed px-4 py-3 rounded-lg border border-emerald-200 bg-white shadow-sm ${
              cell.output.toLowerCase().includes('traceback') || cell.output.toLowerCase().includes('error')
                ? 'text-rose-600 border-rose-200 bg-rose-50/30'
                : 'text-slate-900'
            }`}>
              {cell.output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
