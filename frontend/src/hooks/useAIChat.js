import { useState, useCallback, useRef } from 'react';
import { aiAPI } from '../api/ai';

/**
 * useAIChat — Hook for streaming AI chat conversations
 *
 * Usage:
 *   const { messages, input, setInput, sendMessage, isLoading, sessionId, clearMessages } = useAIChat();
 */
export function useAIChat(initialSessionId = null) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback((messageText = null) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create a placeholder for the assistant's streaming message
    let assistantContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    abortRef.current = aiAPI.streamChat(
      text,
      sessionId,
      // onChunk
      (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantContent, streaming: true };
          }
          return updated;
        });
      },
      // onDone
      (data) => {
        if (data.sessionId) setSessionId(data.sessionId);
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantContent || data.content, streaming: false };
          }
          return updated;
        });
        setIsLoading(false);
      },
      // onError
      (err) => {
        setError(err);
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant' && !updated[lastIdx].content) {
            return updated.slice(0, -1); // Remove empty assistant message
          }
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], streaming: false };
          }
          return updated;
        });
        setIsLoading(false);
      }
    );

    return text;
  }, [input, isLoading, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.role === 'assistant') {
        updated[lastIdx] = { ...updated[lastIdx], streaming: false };
      }
      return updated;
    });
  }, []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    sessionId,
    error,
    clearMessages,
    stopStreaming,
  };
}
