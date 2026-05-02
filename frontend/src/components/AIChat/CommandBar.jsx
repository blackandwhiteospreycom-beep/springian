import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaRobot, FaTimes, FaArrowUp, FaArrowDown, FaRegCommentDots, FaChartBar, FaBolt } from 'react-icons/fa';
import { useAIChat } from '../../hooks/useAIChat';
import { aiAPI } from '../../api/ai';

/**
 * CommandBar — Ctrl+K overlay for AI commands
 */
function CommandBar({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' | 'query'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const { sendMessage, sessionId } = useAIChat();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInput('');
      setResults([]);
      setSelectedIndex(0);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Global keyboard listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle is handled by parent
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        executeCommand(results[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, selectedIndex, onClose]);

  const quickActions = [
    { label: 'Chat with AI', icon: <FaRegCommentDots />, action: () => setMode('chat') },
    { label: 'Ask about data', icon: <FaChartBar />, action: () => setMode('query') },
    { label: 'Show service overview', icon: <FaBolt />, action: () => executeQuickAction('Show me an overview of my services') },
    { label: 'Show key metrics', icon: <FaBolt />, action: () => executeQuickAction('What are my key business metrics?') },
  ];

  const executeQuickAction = (text) => {
    if (mode === 'chat') {
      sendMessage(text);
      onClose();
    } else {
      executeQuery(text);
    }
  };

  const executeQuery = async (text) => {
    setIsLoading(true);
    try {
      const response = await aiAPI.query(text);
      setResults([{ type: 'result', content: response.data?.answer || 'No results found' }]);
    } catch (err) {
      setResults([{ type: 'error', content: 'Query failed. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = (cmd) => {
    if (cmd.type === 'result') return;

    const text = cmd.label || cmd.text;
    if (mode === 'chat') {
      sendMessage(text);
    } else {
      executeQuery(text);
    }
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === 'chat') {
      sendMessage(input);
    } else {
      executeQuery(input);
    }
    setHistory(prev => [input, ...prev].slice(0, 10));
    setInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Command Bar */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 overflow-hidden animate-command-appear">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <FaRobot className="text-purple-500 flex-shrink-0" size={20} />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'chat' ? 'Ask AI anything...' : 'Ask about your data...'}
              className="w-full text-lg outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
          </form>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <button
              type="button"
              onClick={() => setMode(mode === 'chat' ? 'query' : 'chat')}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-600"
            >
              {mode === 'chat' ? 'Chat' : 'Query'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Results / Quick Actions */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <FaSearch className="animate-spin mr-2" />
              <span>AI is thinking...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              {results.map((result, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${
                  result.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3">
              <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quick Actions
              </p>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    idx === selectedIndex ? 'bg-gray-100' : ''
                  }`}
                >
                  <span className="text-gray-500">{action.icon}</span>
                  <span className="text-sm text-gray-700 flex-1 text-left">{action.label}</span>
                  {action.label.includes('Chat') || action.label.includes('data') ? (
                    <span className="text-xs text-gray-400">Switch mode</span>
                  ) : (
                    <span className="text-xs text-gray-400">↵</span>
                  )}
                </button>
              ))}

              {history.length > 0 && (
                <>
                  <p className="px-4 py-2 mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent
                  </p>
                  {history.slice(0, 3).map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(h)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <FaSearch className="text-gray-400" size={12} />
                      <span className="text-sm text-gray-600 truncate">{h}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↵</kbd> Execute</span>
          <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Esc</kbd> Close</span>
        </div>
      </div>
    </>
  );
}

export default CommandBar;
