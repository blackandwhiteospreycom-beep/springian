import React from 'react';
import { FaRobot, FaUser, FaCopy, FaSpinner } from 'react-icons/fa';

/**
 * AIMessage — Individual chat message bubble
 */
function AIMessage({ message }) {
  const { role, content, streaming } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 px-4 py-3 ${isUser ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
      }`}>
        {isUser ? <FaUser size={14} /> : <FaRobot size={14} />}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {content || (streaming ? '' : '...')}
        </div>

        {/* Streaming indicator */}
        {streaming && !content && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            <FaSpinner className="animate-spin" size={12} />
            <span>Thinking...</span>
          </div>
        )}

        {/* Cursor blink for streaming */}
        {streaming && content && (
          <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
        )}
      </div>

      {/* Actions (AI messages only) */}
      {!isUser && content && !streaming && (
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
          title="Copy response"
        >
          {copied ? (
            <span className="text-xs text-green-500">✓</span>
          ) : (
            <FaCopy size={12} />
          )}
        </button>
      )}
    </div>
  );
}

export default AIMessage;
