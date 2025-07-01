import React, { useState, useEffect } from 'react';
import { Send, Bot, User, FileText, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatContext, setChatContext] = useState<'file' | 'database'>('database');
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/conversations/');
      if (!response.ok) {
        throw new Error('Failed to fetch conversation history');
      }
      const history: any[] = await response.json();
      const formattedHistory: Message[] = history.flatMap(h => [
        { sender: 'user' as const, text: h.question },
        { sender: 'ai' as const, text: h.answer }
      ]);
      setMessages(formattedHistory.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentInput,
          context: chatContext,
          file_id: null, // Needs to be implemented
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse: Message = { sender: 'ai', text: data.answer };
      setMessages(prev => [...prev, aiResponse]);

    } catch (err) {
      const errorResponse: Message = {
        sender: 'ai',
        text: err instanceof Error ? err.message : 'An unknown error occurred',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Chat</h1>
        <p className="text-slate-600 dark:text-slate-300">Discuss with the AI about a file or the entire database.</p>
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={() => setChatContext('database')}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${chatContext === 'database' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <Database className="h-4 w-4" />
            <span>Database</span>
          </button>
          <button
            onClick={() => setChatContext('file')}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${chatContext === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <FileText className="h-4 w-4" />
            <span>Specific File</span>
          </button>
        </div>
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><Bot /></div>}
              <div className={`p-4 rounded-lg max-w-2xl ${msg.sender === 'ai' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-blue-500 text-white'}`}>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              </div>
              {msg.sender === 'user' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><User /></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <Bot className="h-6 w-6 text-blue-500" />
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto w-full flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something..."
            className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button aria-label="Send message" onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};