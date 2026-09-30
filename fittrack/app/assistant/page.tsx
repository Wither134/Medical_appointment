'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useAppContext, useChat } from '@/context/AppContext'
import { generateAIResponse } from '@/lib/ai-assistant'
import { Button } from '@/components/ui/Button'

const SUGGESTED_QUESTIONS = [
  'How many workouts did I complete this week?',
  'How many calories did I burn?',
  'What workouts did I do recently?',
  'How am I progressing toward my goals?',
  'What should I focus on today?',
  "Give me a fitness summary.",
]

function renderMarkdown(text: string): string {
  // Very lightweight bold rendering: **text** → <strong>text</strong>
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

export default function AssistantPage() {
  const { state } = useAppContext()
  const { chatHistory, addMessage, clearChat } = useChat()
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, loading])

  async function sendMessage(text: string) {
    const msg = text.trim()
    if (!msg || loading) return

    setInput('')
    addMessage({ role: 'user', content: msg })
    setLoading(true)

    // Simulate a short delay for a more natural feel
    await new Promise(r => setTimeout(r, 600))

    const response = generateAIResponse(msg, state.workouts, state.goals)
    addMessage({ role: 'assistant', content: response })
    setLoading(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Fitness Assistant</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about your fitness data</p>
        </div>
        {chatHistory.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>Clear chat</Button>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 mb-4">
        {/* Welcome message */}
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <span className="text-5xl mb-4">🤖</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your AI Fitness Assistant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
              I can answer questions about your workouts, goals, and progress. Try one of the suggestions below!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {chatHistory.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                className="leading-relaxed"
              />
              <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">🤖</div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions (after first message) */}
      {chatHistory.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about your fitness data... (Enter to send)"
          rows={2}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 h-12"
        >
          Send →
        </Button>
      </div>
    </div>
  )
}
