import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaTrash, FaRobot, FaSpinner, FaStop } from 'react-icons/fa';
import { useAIChat } from '../../hooks/useAIChat';
import AIMessage from './AIMessage';

/**
 * AIChatPanel — Slide-in AI chat panel
 */
function AIChatPanel({ isOpen, onClose }) {
  const { messages, input, setInput, sendMessage, isLoading, clearMessages, stopStreaming, error } = useAIChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <FaRobot size={18} />
            <h2 className="font-semibold text-lg">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Clear conversation"
              >
                <FaTrash size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Close"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Banner */}
          {error && (
            <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <p className="font-semibold mb-1">AI Error</p>
              <p>{error}</p>
              <p className="text-xs text-red-500 mt-1">Make sure Ollama is running: run `ollama serve` in a terminal</p>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
                <FaRobot size={32} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                How can I help you today?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ask me anything about your services, users, or analytics data.
              </p>
              <div className="grid gap-2 w-full max-w-xs">
                {[
                  'Show me an overview of my services',
                  'How many users do I have?',
                  'What are my key metrics?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => sendMessage(suggestion), 50);
                    }}
                    className="px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg, idx) => (
                <AIMessage key={idx} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-24"
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="self-end px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Stop generating"
              >
                <FaStop size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="self-end px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={14} />
              </button>
            )}
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </>
  );
}

export default AIChatPanel;
