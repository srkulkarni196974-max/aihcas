'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';


interface Message {
  id: number;
  text: string;
  sender: 'ai' | 'user';
  time: string;
}

// Simple markdown-to-HTML for AI responses
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(77,166,232,0.1);padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>')
    .replace(/^#{3}\s+(.+)$/gm, '<h4 style="font-size:0.95rem;font-weight:700;margin:10px 0 4px">$1</h4>')
    .replace(/^#{2}\s+(.+)$/gm, '<h3 style="font-size:1.05rem;font-weight:700;margin:12px 0 6px">$1</h3>')
    .replace(/^[-*]\s+(.+)$/gm, '<li style="margin-left:16px;list-style:disc;margin-bottom:4px">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function detectTriage(text: string): 'self' | 'consult' | 'emergency' | null {
  const lower = text.toLowerCase();
  if (lower.includes('emergency') || lower.includes('call 112') || lower.includes('ambulance') || lower.includes('immediately seek')) return 'emergency';
  if (lower.includes('consult a doctor') || lower.includes('see a doctor') || lower.includes('visit a physician')) return 'consult';
  if (lower.includes('self-care') || lower.includes('rest and hydration') || lower.includes('home remedy')) return 'self';
  return null;
}

const QUICK_PROMPTS = [
  { label: '🤒 Fever & Headache', text: 'I have a fever and headache since yesterday. What should I do?' },
  { label: '💊 Drug Interaction', text: 'Can I take Paracetamol and Ibuprofen together?' },
  { label: '🫀 Chest Tightness', text: 'I\'m feeling tightness in my chest and mild breathlessness.' },
  { label: '🩺 Blood Pressure', text: 'My blood pressure reading is 140/90. Is this concerning?' },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => [{
    id: 1,
    text: `Hello! I'm **Dr. AIHCAS**, your AI health assistant. I'm here to listen and help.

Please tell me — what's been bothering you today? Feel free to describe your symptoms in your own words, and I'll ask a few questions to better understand your situation.`,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<Message[]>([]);


  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      if (user?.userId) {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.userId)
          .order('updated_at', { ascending: false });
        if (data) setConversations(data);
      }
    }
    fetchConversations();
  }, [user?.userId]);

  // Load messages for active conversation
  useEffect(() => {
    async function fetchMessages() {
      if (activeConversationId) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true });
        
        if (data) {
          setMessages(data.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.role === 'assistant' ? 'ai' : 'user',
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      } else if (user) {
        setMessages([{
          id: 1,
          text: `Hello **${user.name}**! I'm **Dr. AIHCAS**, your AI health assistant. It's good to see you today.\n\nHow are you feeling? Please describe what's been going on and I'll do my best to help.`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    }
    fetchMessages();
  }, [activeConversationId, user]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  const sendMessage = async (text?: string) => {
    const messageText = (text || inputValue).trim();
    if (!messageText || isTyping) return;

    const newUserMsg: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { chatAction } = await import('@/app/actions');

      // 1. Ensure conversation exists
      let conversationId = activeConversationId;
      if (!conversationId && user?.userId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.userId,
            title: messageText.substring(0, 40) + (messageText.length > 40 ? '...' : ''),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (data) {
          conversationId = data.id;
          setActiveConversationId(data.id);
          setConversations(prev => [data, ...prev]);
        }
      }

      // 2. Save user message to Supabase
      if (conversationId && user?.userId) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          user_id: user.userId,
          role: 'user',
          content: messageText,
          created_at: new Date().toISOString(),
        });
      }

      const currentHistory = [
        ...messages,
        newUserMsg
      ].map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }],
      }));

      // Load health profile from Supabase for personalization
      let profile = null;
      if (user?.userId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.userId)
          .single();
        profile = profileData;
      }

      const responseText = await chatAction(messageText, JSON.stringify(currentHistory), profile);

      const aiResponse: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      // 3. Save AI response to Supabase
      if (conversationId && user?.userId) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          user_id: user.userId,
          role: 'assistant',
          content: responseText,
          created_at: new Date().toISOString(),
        });
        
        // Update conversation timestamp
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting. Please ensure your GEMINI_API_KEY is configured in .env.local",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyText = (id: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clearChat = () => {
    setActiveConversationId(null);
    setMessages([{
      id: Date.now(),
      text: `Hello${user ? ` **${user.name}**` : ''}! Starting a fresh consultation. What brings you in today? Please describe your symptoms or concern.`,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };


  return (
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 64px)', margin: '-32px', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{ width: 260, background: 'rgba(255,255,255,0.85)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px' }}>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={clearChat}>
            + New Consultation
          </button>
        </div>

        <div style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Quick Prompts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                style={{
                  padding: '10px 12px', borderRadius: 10, background: 'var(--primary)', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  color: 'var(--primary-deep)', transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-mid)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 16px 16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Recent Conversations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                style={{
                  padding: '10px 12px', borderRadius: 10, background: activeConversationId === c.id ? 'var(--primary-mid)' : 'transparent', border: '1px solid',
                  borderColor: activeConversationId === c.id ? 'var(--primary-deep)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontWeight: activeConversationId === c.id ? 700 : 500,
                  color: activeConversationId === c.id ? 'var(--primary-deep)' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}
              >
                📝 {c.title || 'Untitled Chat'}
              </button>
            ))}
            {conversations.length === 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', padding: 10 }}>No history yet</div>
            )}
          </div>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
          <div className="glass-card" style={{ padding: 14, background: 'rgba(229,62,62,0.05)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              ⚠️ AI Assistant can make mistakes. Always consult a real doctor for serious symptoms.
            </p>
          </div>
        </div>

      </aside>

      {/* Chat Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(245,248,255,0.3)', minWidth: 0 }}>
        {/* Header */}
        <header style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. AIHCAS</div>
              <div style={{ fontSize: '0.78rem', color: '#2EC4A0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2EC4A0', display: 'inline-block' }} />
                AI General Physician • Always Available
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={clearChat} title="New Chat">🔄 New Chat</button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg) => {
              const triage = msg.sender === 'ai' ? detectTriage(msg.text) : null;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`} style={{ position: 'relative', maxWidth: '82%' }}>
                    {msg.sender === 'ai' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} style={{ lineHeight: 1.65 }} />
                    ) : (
                      <span>{msg.text}</span>
                    )}
                    {triage && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`triage-badge triage-${triage}`}>
                          {triage === 'self' && '✅ Self-Care Recommended'}
                          {triage === 'consult' && '🩺 Doctor Consultation Advised'}
                          {triage === 'emergency' && '🚨 Emergency Action Required'}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{msg.time}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => copyText(msg.id, msg.text)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, transition: 'all 0.2s' }}
                          title="Copy response"
                        >
                          {copiedId === msg.id ? '✅ Copied' : '📋 Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="message-bubble message-ai" style={{ alignSelf: 'flex-start', padding: '14px 20px' }}>
                <div className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
          <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                className="input-field"
                placeholder="Describe your symptoms (e.g. I have a sore throat and headache since 2 days)..."
                rows={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                style={{ resize: 'none', paddingRight: 48, minHeight: 52, maxHeight: 150, lineHeight: 1.55, overflowY: 'auto' }}
              />
              <div style={{ position: 'absolute', right: 10, bottom: 10, fontSize: '0.72rem', color: 'var(--text-light)' }}>
                ↵ Send
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={isTyping || !inputValue.trim()}
              style={{ padding: '14px 22px', opacity: (isTyping || !inputValue.trim()) ? 0.6 : 1, flexShrink: 0 }}
            >
              {isTyping ? '⏳' : '🚀'} Send
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: 10 }}>
            Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
