'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Send, 
  Bot, 
  Activity, 
  PhoneCall, 
  Pill, 
  FileText, 
  AlertTriangle,
  History,
  Heart,
  CheckCircle,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

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
    .replace(/`(.+?)`/g, '<code style="background:rgba(30,58,138,0.06);padding:2px 6px;border-radius:4px;font-size:0.9em;font-weight:700;color:var(--primary-deep)">$1</code>')
    .replace(/^#{3}\s+(.+)$/gm, '<h4 style="font-size:0.95rem;font-weight:800;margin:12px 0 4px;color:var(--text-dark)">$1</h4>')
    .replace(/^#{2}\s+(.+)$/gm, '<h3 style="font-size:1.05rem;font-weight:800;margin:14px 0 6px;color:var(--text-dark)">$1</h3>')
    .replace(/^[-*]\s+(.+)$/gm, '<li style="margin-left:16px;list-style:disc;margin-bottom:6px;color:var(--text-muted)">$1</li>')
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
  { label: 'Fever & Headache', text: 'I have a fever and headache since yesterday. What should I do?', icon: <Activity className="w-3.5 h-3.5 text-[#1E3A8A]" /> },
  { label: 'Drug Interaction', text: 'Can I take Paracetamol and Ibuprofen together?', icon: <Pill className="w-3.5 h-3.5 text-[#0D9488]" /> },
  { label: 'Chest Tightness', text: 'I\'m feeling tightness in my chest and mild breathlessness.', icon: <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" /> },
  { label: 'Blood Pressure', text: 'My blood pressure reading is 140/90. Is this concerning?', icon: <Heart className="w-3.5 h-3.5 text-[#B38F5D]" /> },
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
    <div className="page-fade chat-container stack-mobile" style={{ border: '1.5px solid var(--border)', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* Sidebar - Hidden on mobile by default */}
      <aside className="hide-mobile" style={{ width: 260, background: 'rgba(255,255,255,0.85)', borderRight: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px' }}>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', borderRadius: 100, fontWeight: 700 }} onClick={clearChat}>
            <Plus className="w-4 h-4" /> New Consultation
          </button>
        </div>

        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Quick Prompts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                style={{
                  padding: '11px 14px', borderRadius: 12, background: 'var(--primary)', border: '1px solid rgba(30, 58, 138, 0.04)',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                  color: 'var(--primary-deep)', transition: 'all 0.2s', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--primary-mid)';
                  e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.04)';
                }}
              >
                {q.icon}
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '0 16px 16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <History className="w-3.5 h-3.5" /> Recent Consultations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConversationId(c.id)}
                style={{
                  padding: '10px 14px', borderRadius: 12, 
                  background: activeConversationId === c.id ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.06), rgba(179, 143, 93, 0.03))' : 'transparent', 
                  border: '1px solid',
                  borderColor: activeConversationId === c.id ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                  textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', fontWeight: activeConversationId === c.id ? 700 : 600,
                  color: activeConversationId === c.id ? 'var(--primary-deep)' : 'var(--text-muted)', transition: 'all 0.2s', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                {c.title || 'Untitled Chat'}
              </button>
            ))}
            {conversations.length === 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', padding: 12, fontWeight: 600 }}>No previous records</div>
            )}
          </div>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
          <div className="glass-card" style={{ padding: 14, background: 'rgba(217, 119, 6, 0.04)', border: '1px solid rgba(217, 119, 6, 0.12)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55, display: 'flex', gap: 6 }}>
              <ShieldAlert className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              AI guidance is not a replacement for clinical doctor checkups.
            </p>
          </div>
        </div>
      </aside>

      {/* Chat Main Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #FCFBF9, #F8FAFC)', minWidth: 0 }}>
        {/* Header */}
        <header style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #B38F5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-dark)' }}>Dr. AIHCAS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary-deep)', display: 'inline-block' }} />
                AI General Physician • Diagnostics Online
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={clearChat} title="Reset Chat Workspace" style={{ borderRadius: 100, border: '1px solid var(--border)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset Consultation
            </button>
          </div>
        </header>

        {/* Messages list */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {messages.map((msg) => {
              const triage = msg.sender === 'ai' ? detectTriage(msg.text) : null;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`} style={{ 
                    position: 'relative', 
                    maxWidth: '82%',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary-deep), #2A437E)' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'var(--text-dark)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.01)',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '14px 20px',
                    textAlign: 'left'
                  }}>
                    {msg.sender === 'ai' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} style={{ lineHeight: 1.6, fontSize: '0.85rem' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem' }}>{msg.text}</span>
                    )}

                    {triage && (
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge" style={{ 
                          fontWeight: 800, 
                          padding: '4px 10px', 
                          fontSize: '0.72rem', 
                          borderRadius: 100,
                          background: triage === 'emergency' ? '#FFF5F5' : triage === 'consult' ? '#FAF6F0' : '#E8F5E9',
                          color: triage === 'emergency' ? '#DC2626' : triage === 'consult' ? '#B38F5D' : '#0D9488',
                          border: `1px solid ${triage === 'emergency' ? 'rgba(220,38,38,0.15)' : triage === 'consult' ? 'rgba(179,143,93,0.15)' : 'rgba(13,148,136,0.15)'}`
                        }}>
                          {triage === 'self' && '✅ Self-Care Protocol'}
                          {triage === 'consult' && '🩺 Consult Clinician'}
                          {triage === 'emergency' && '🚨 Critical Alert Call 112'}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTop: `1px solid ${msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.6)'}`, paddingTop: 6 }}>
                      <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{msg.time}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => copyText(msg.id, msg.text)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 6, transition: 'all 0.2s', fontWeight: 700 }}
                          title="Copy details to clipboard"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#0D9488]" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Log
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '18px 18px 18px 4px', padding: '14px 20px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.01)' }}>
                <div className="typing-indicator" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: '#B38F5D', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, background: '#1E3A8A', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }} />
                  <span className="typing-dot" style={{ width: 6, height: 6, background: '#0D9488', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                className="input-field"
                placeholder="Describe symptoms in detail (e.g., headache with sensitivity to light since morning)..."
                rows={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                style={{ resize: 'none', paddingRight: 48, minHeight: 52, maxHeight: 150, lineHeight: 1.55, overflowY: 'auto', border: '1.5px solid var(--border)', borderRadius: '14px', background: '#F8FAFC' }}
              />
              <div style={{ position: 'absolute', right: 12, bottom: 16, fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 700 }}>
                ↵ Send
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={isTyping || !inputValue.trim()}
              style={{ padding: '14px 22px', borderRadius: '12px', opacity: (isTyping || !inputValue.trim()) ? 0.6 : 1, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-light)', marginTop: 8, fontWeight: 500 }}>
            Type freely in natural language • Press <strong>Enter</strong> to submit • <strong>Shift+Enter</strong> for a new line
          </p>
        </div>
      </div>
    </div>
  );
}
