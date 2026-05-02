import React, { useState, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import AIChatPanel from './AIChatPanel';
import CommandBar from './CommandBar';

/**
 * AIIntegration — Floating AI button + Ctrl+K handler + AI panels
 * Drop this into any layout to enable AI features globally.
 */
function AIIntegration() {
  const [chatOpen, setChatOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center"
        title="AI Assistant (Ctrl+K for command bar)"
      >
        <FaRobot size={22} />
      </button>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Command Bar */}
      <CommandBar isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}

export default AIIntegration;
