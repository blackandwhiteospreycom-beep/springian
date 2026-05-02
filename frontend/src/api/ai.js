import axios from 'axios';

const AI_API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai`;

/**
 * Send a streaming chat message to the AI
 * Returns an EventSource-like handler for streaming chunks
 */
function streamChat(message, sessionId, onChunk, onDone, onError) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${AI_API_BASE_URL}/chat`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  let buffer = '';

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 3) {
      // Streaming — parse SSE chunks
      const newData = xhr.responseText.substring(buffer.length);
      buffer = xhr.responseText;

      const lines = newData.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'chunk' && onChunk) {
              onChunk(parsed.content);
            } else if (parsed.type === 'done' && onDone) {
              onDone(parsed);
            } else if (parsed.type === 'error' && onError) {
              onError(parsed.error);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }

    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Final parse for any remaining data
        const lines = buffer.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'done' && onDone) onDone(parsed);
            } catch (e) {}
          }
        }
      } else if (onError) {
        try {
          const err = JSON.parse(xhr.responseText);
          onError(err.error || 'Chat failed');
        } catch (e) {
          onError('Chat failed');
        }
      }
    }
  };

  xhr.send(JSON.stringify({ message, sessionId }));

  return xhr;
}

/**
 * Non-streaming AI query (natural language data query)
 */
async function query(prompt) {
  const response = await axios.post(`${AI_API_BASE_URL}/query`, { prompt });
  return response.data;
}

/**
 * Get AI suggestions for a context
 */
async function suggest(context, entityType, entityId) {
  const response = await axios.post(`${AI_API_BASE_URL}/suggest`, { context, entityType, entityId });
  return response.data;
}

/**
 * Get all AI sessions
 */
async function getSessions() {
  const response = await axios.get(`${AI_API_BASE_URL}/sessions`);
  return response.data;
}

/**
 * Get a single AI session with history
 */
async function getSession(id) {
  const response = await axios.get(`${AI_API_BASE_URL}/sessions/${id}`);
  return response.data;
}

/**
 * Delete an AI session
 */
async function deleteSession(id) {
  const response = await axios.delete(`${AI_API_BASE_URL}/sessions/${id}`);
  return response.data;
}

/**
 * Create a new AI session
 */
async function createSession(title) {
  const response = await axios.post(`${AI_API_BASE_URL}/session`, { title });
  return response.data;
}

/**
 * Get user's AI memory
 */
async function getMemory(type = null) {
  const params = type ? { type } : {};
  const response = await axios.get(`${AI_API_BASE_URL}/memory`, { params });
  return response.data;
}

/**
 * Clear all AI memory
 */
async function clearMemory() {
  const response = await axios.delete(`${AI_API_BASE_URL}/memory`);
  return response.data;
}

/**
 * Get AI usage statistics
 */
async function getUsage() {
  const response = await axios.get(`${AI_API_BASE_URL}/usage`);
  return response.data;
}

// Export
export const aiAPI = {
  streamChat,
  query,
  suggest,
  getSessions,
  getSession,
  deleteSession,
  createSession,
  getMemory,
  clearMemory,
  getUsage,
};

export default aiAPI;
