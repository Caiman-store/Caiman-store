/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Delete, 
  RotateCcw, 
  Settings, 
  History, 
  Plus, 
  Minus, 
  Divide, 
  X, 
  Percent, 
  Equal
} from 'lucide-react';

interface Calculation {
  expression: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [isError, setIsError] = useState(false);

  const handleNumber = (num: string) => {
    if (isError) {
      setDisplay(num);
      setIsError(false);
      return;
    }
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (isError) return;
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsError(false);
  };

  const handleBackspace = () => {
    if (isError) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercent = () => {
    try {
      const val = parseFloat(display) / 100;
      setDisplay(val.toString());
    } catch {
      setIsError(true);
    }
  };

  const handleCalculate = () => {
    if (!equation) return;
    
    try {
      const fullExpression = equation + display;
      const cleanExpression = fullExpression.replace(/×/g, '*').replace(/÷/g, '/');
      const result = eval(cleanExpression);
      
      const resString = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
      
      setDisplay(resString);
      setEquation('');
      
      setHistory(prev => [{
        expression: fullExpression,
        result: resString,
        timestamp: Date.now()
      }, ...prev].slice(0, 50));
      
    } catch {
      setDisplay('Error');
      setIsError(true);
    }
  };

  const handlePoint = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('×');
      if (e.key === '/') handleOperator('÷');
      if (e.key === 'Enter' || e.key === '=') handleCalculate();
      if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') handleClear();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === '.') handlePoint();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation, isError]);

  return (
    <div className="flex flex-col h-screen bg-[#0F0F12] text-[#E0E0E0] font-sans overflow-hidden select-none">
      {/* Header Navigation */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#141418] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <div className="w-4 h-[2px] bg-black"></div>
          </div>
          <span className="font-medium tracking-tight text-lg">LUMINA_PRO / <span className="text-white/40 uppercase">v4.2_stable</span></span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold hidden md:inline">Precision Engine Enabled</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Calculation History */}
        <aside className="hidden lg:flex w-72 border-r border-white/10 bg-[#0A0A0C] flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">History Log</h2>
            <button 
              onClick={() => setHistory([])}
              className="text-[10px] text-white/20 hover:text-white/40 transition-colors cursor-pointer uppercase font-bold"
            >
              Clear All
            </button>
          </div>
          <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
            {history.length === 0 ? (
              <div className="text-white/10 text-xs italic">No entries in session...</div>
            ) : (
              history.map((item) => (
                <div key={item.timestamp} className="border-l border-white/10 pl-4 group hover:border-white/20 transition-colors">
                  <p className="text-xs font-mono text-white/30 mb-1 truncate">{item.expression}</p>
                  <p className="text-xl font-light text-white/80">{item.result}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Central: Main Calculator Engine */}
        <section className="flex-1 flex flex-col bg-[#0F0F12] relative overflow-hidden">
          <div className="flex-1 flex flex-col p-6 md:p-12 max-w-4xl mx-auto w-full">
            {/* Display Area */}
            <div className="flex-1 flex flex-col justify-center items-end border-b border-white/5 mb-8">
              <span className="text-white/20 text-xl font-mono mb-2 tracking-wider h-8 overflow-hidden">
                {equation || (history.length > 0 ? `Ans = ${history[0].result}` : 'System Standby')}
              </span>
              <motion.h1 
                key={display}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-6xl md:text-8xl font-light tracking-tighter break-all text-right w-full ${isError ? 'text-red-500' : 'text-white'}`}
              >
                {display.includes('.') ? (
                  <>
                    {display.split('.')[0]}.<span className="text-white/40">{display.split('.')[1]}</span>
                  </>
                ) : (
                  display
                )}
              </motion.h1>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 h-[350px] md:h-[450px]">
              <CalcButton label="AC" onClick={handleClear} variant="utility" />
              <CalcButton label="±" onClick={() => setDisplay(prev => (parseFloat(prev) * -1).toString())} variant="utility" />
              <CalcButton label="%" onClick={handlePercent} variant="utility" />
              <CalcButton label="÷" onClick={() => handleOperator('÷')} variant="operator" />

              <CalcButton label="7" onClick={() => handleNumber('7')} />
              <CalcButton label="8" onClick={() => handleNumber('8')} />
              <CalcButton label="9" onClick={() => handleNumber('9')} />
              <CalcButton label="×" onClick={() => handleOperator('×')} variant="operator" />

              <CalcButton label="4" onClick={() => handleNumber('4')} />
              <CalcButton label="5" onClick={() => handleNumber('5')} />
              <CalcButton label="6" onClick={() => handleNumber('6')} />
              <CalcButton label="−" onClick={() => handleOperator('-')} variant="operator" />

              <CalcButton label="1" onClick={() => handleNumber('1')} />
              <CalcButton label="2" onClick={() => handleNumber('2')} />
              <CalcButton label="3" onClick={() => handleNumber('3')} />
              <CalcButton label="+" onClick={() => handleOperator('+')} variant="operator" />

              <CalcButton label="0" onClick={() => handleNumber('0')} className="col-span-2" />
              <CalcButton label="." onClick={handlePoint} />
              <CalcButton label="=" onClick={handleCalculate} variant="equal" />
            </div>
          </div>
        </section>

        {/* Sidebar: Scientific Functions & Constants */}
        <aside className="hidden xl:flex w-72 border-l border-white/10 bg-[#141418] flex-col overflow-hidden shrink-0">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">Operations</h2>
            <div className="grid grid-cols-2 gap-2">
              <FunctionChip label="sin" />
              <FunctionChip label="cos" />
              <FunctionChip label="tan" />
              <FunctionChip label="log" />
              <FunctionChip label="ln" />
              <FunctionChip label="rad" />
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-6">Constants</h2>
            <div className="space-y-4">
              <ConstantItem symbol="π (pi)" value="3.14159" />
              <ConstantItem symbol="e (euler)" value="2.71828" />
              <ConstantItem symbol="φ (phi)" value="1.61803" />
              <ConstantItem symbol="c (light)" value="299,792,458" />
            </div>
          </div>

          <div className="p-6 bg-[#1A1A20] mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-white/60">Matrix Active</span>
            </div>
            <p className="text-[9px] text-white/20 uppercase">Workspace: local_v4_alpha</p>
          </div>
        </aside>
      </main>

      {/* Bottom Bar */}
      <footer className="h-10 border-t border-white/10 flex items-center justify-between px-8 text-[10px] uppercase tracking-widest text-white/20 font-bold bg-[#0A0A0C] shrink-0">
        <div className="flex gap-8">
          <span>Session: 00:01:24</span>
          <span>Buffer: 12.4 MB</span>
        </div>
        <div className="flex gap-8 hidden sm:flex">
          <span className="text-white/40">Float: 64-bit Precision</span>
          <span>Engine: Antigravity_v1</span>
        </div>
      </footer>
    </div>
  );
}

function CalcButton({ 
  label, 
  onClick, 
  variant = 'number', 
  className = ''
}: { 
  label: string; 
  onClick: () => void; 
  variant?: 'number' | 'operator' | 'utility' | 'equal';
  className?: string;
}) {
  const variants = {
    number: "border border-white/10 bg-white/[0.02] hover:bg-white/10 text-white text-xl md:text-2xl transition-all duration-150 active:scale-95",
    operator: "bg-white text-black font-bold text-xl md:text-2xl hover:bg-white/90 active:bg-white/80 active:scale-95",
    utility: "border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 font-medium text-sm md:text-lg uppercase tracking-widest active:scale-95",
    equal: "bg-[#FF5F1F] text-white font-bold text-2xl md:text-3xl hover:brightness-110 active:scale-90 shadow-[0_0_20px_rgba(255,95,31,0.2)]"
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${variants[variant]} ${className}`}
      id={`btn-${label}`}
    >
      {label}
    </button>
  );
}

function FunctionChip({ label }: { label: string }) {
  return (
    <button className="h-10 md:h-12 border border-white/10 flex items-center justify-center text-[10px] text-white/40 font-mono hover:bg-white/5 hover:text-white/80 transition-all cursor-pointer uppercase tracking-tighter">
      {label}
    </button>
  );
}

function ConstantItem({ symbol, value }: { symbol: string; value: string }) {
  return (
    <div className="flex justify-between items-center group cursor-help">
      <span className="text-white/60 font-mono text-sm group-hover:text-white transition-colors">{symbol}</span>
      <span className="text-white/20 text-[10px] group-hover:text-white/40">{value}</span>
    </div>
  );
}

