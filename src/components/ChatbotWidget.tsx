import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Requests go to our Express server (/api/chat) which calls Gemini AI directly.
// No n8n, no webhooks — the AI agent runs fully server-side.
const WEBHOOK_URL = '/api/chat';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'أهلاً وسهلاً! 🔥 أنا جمرة، مساعدتك الذكية في كُومُر كُونافيه.\nكيف بقدر أساعدك؟ تقدر تسألني عن قائمتنا، الأسعار، أوقات العمل، أو تبحث عن الكنافة المناسبة لمناسبتك! 💛',
  timestamp: new Date(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated "three dots" typing indicator */
const TypingIndicator: React.FC = () => (
  <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
    <span />
    <span />
    <span />
  </div>
);

/** Individual message bubble */
const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`chatbot-msg-row ${isUser ? 'chatbot-msg-row--user' : 'chatbot-msg-row--assistant'}`}
    >
      {!isUser && (
        <div className="chatbot-avatar" aria-hidden="true">
          🔥
        </div>
      )}
      <div className={`chatbot-bubble ${isUser ? 'chatbot-bubble--user' : 'chatbot-bubble--assistant'}`}>
        <p className="chatbot-bubble__text">{msg.text}</p>
        <span className="chatbot-bubble__time">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Show welcome message only on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    }
  }, [isOpen, hasOpened]);

  // Scroll to bottom whenever messages change or typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: uid(), role: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const rawText = await res.text().catch(() => '');
      let data: any = null;
      try {
        if (rawText && rawText.trim()) {
          data = JSON.parse(rawText);
        }
      } catch {
        data = { output: rawText };
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || `HTTP ${res.status}`);
      }

      // Handle various n8n response shapes
      const replyText: string =
        data?.reply ??
        data?.output ??
        data?.text ??
        data?.message ??
        (typeof data === 'string' ? data : null) ??
        'عذراً، لم أتمكن من فهم الرد. يرجى المحاولة مجدداً.\n\nSorry, I couldn\'t understand the response. Please try again.';

      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        text: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[ChatbotWidget] Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: 'عذراً، يبدو أن هناك مشكلة في الاتصال. يرجى المحاولة مجدداً أو تواصل معنا مباشرةً على واتساب: 0562-606-061 💛',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen((v) => !v);

  return (
    <>
      {/* ── Injected styles ── */}
      <style>{CHATBOT_STYLES}</style>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="chatbot-window"
          role="dialog"
          aria-label="Kunafa-ala-Fahm Smart Assistant"
          aria-modal="true"
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__avatar" aria-hidden="true">🔥</div>
              <div>
                <p className="chatbot-header__title">Kunafa-ala-Fahm Assistant</p>
                <p className="chatbot-header__status">
                  <span className="chatbot-status-dot" aria-hidden="true" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="chatbot-header__close"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-body" role="log" aria-live="polite">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              rows={1}
              aria-label="Message input"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isTyping}
              className="chatbot-send-btn"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        onClick={handleToggle}
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--open' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
        aria-expanded={isOpen}
      >
        {/* Pulse rings */}
        {!isOpen && <span className="chatbot-fab__pulse" aria-hidden="true" />}
        {!isOpen && <span className="chatbot-fab__pulse chatbot-fab__pulse--delay" aria-hidden="true" />}

        {/* Icon: chat bubble → X */}
        <span className={`chatbot-fab__icon ${isOpen ? 'chatbot-fab__icon--close' : ''}`} aria-hidden="true">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
              <path d="M7 9h10M7 13h7" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
// Scoped CSS injected via <style> to avoid Tailwind purge issues for
// dynamically-rendered classes. Uses the project's brand tokens.

const CHATBOT_STYLES = `
  /* ── Tokens ── */
  .chatbot-window, .chatbot-fab {
    --cb-charcoal:    #17120F;
    --cb-espresso:    #35241A;
    --cb-ember:       #C7652D;
    --cb-ember-deep:  #A94E20;
    --cb-gold:        #DAB775;
    --cb-gold-light:  #F0D99A;
    --cb-surface:     #FAF7F2;
    --cb-card:        #FFFFFF;
    --cb-ink:          #211814;
    --cb-ink-muted:    #75675C;
    --cb-line:        rgba(53, 36, 26, 0.12);
    --cb-radius:      20px;
    --cb-shadow:      0 20px 50px rgba(53, 36, 26, 0.16), 0 4px 16px rgba(0,0,0,.06);
  }

  /* ── Window ── */
  .chatbot-window {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 380px;
    max-width: calc(100vw - 32px);
    height: 560px;
    max-height: calc(100dvh - 120px);
    display: flex;
    flex-direction: column;
    background: var(--cb-surface);
    border-radius: var(--cb-radius);
    box-shadow: var(--cb-shadow);
    border: 1px solid var(--cb-line);
    overflow: hidden;
    z-index: 9000;
    animation: cb-slideUp 320ms cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes cb-slideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* ── Header ── */
  .chatbot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--cb-ember) 0%, var(--cb-ember-deep) 100%);
    flex-shrink: 0;
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(199, 101, 45, 0.2);
  }
  .chatbot-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 20% 50%, rgba(218,183,117,.28) 0%, transparent 60%);
    pointer-events: none;
  }
  .chatbot-header__info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .chatbot-header__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,.2);
    border: 1.5px solid rgba(255,255,255,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .chatbot-header__title {
    margin: 0;
    font-size: 13.5px;
    font-weight: 700;
    color: #fff;
    letter-spacing: .01em;
    line-height: 1.3;
  }
  .chatbot-header__status {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: rgba(255,255,255,.9);
    font-weight: 500;
  }
  .chatbot-status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px 1px rgba(74,222,128,.7);
    animation: cb-statusPulse 2.4s ease-in-out infinite;
  }
  @keyframes cb-statusPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: .55; }
  }
  .chatbot-header__close {
    background: rgba(255,255,255,.15);
    border: none;
    cursor: pointer;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    transition: background 180ms ease, transform 180ms ease;
    position: relative;
    z-index: 1;
  }
  .chatbot-header__close:hover { background: rgba(255,255,255,.28); transform: scale(1.07); }
  .chatbot-header__close svg  { width: 16px; height: 16px; }

  /* ── Body ── */
  .chatbot-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
    background: var(--cb-surface);
  }
  .chatbot-body::-webkit-scrollbar { width: 4px; }
  .chatbot-body::-webkit-scrollbar-track { background: transparent; }
  .chatbot-body::-webkit-scrollbar-thumb {
    background: rgba(199,101,45,.25);
    border-radius: 4px;
  }

  /* ── Message Row ── */
  .chatbot-msg-row {
    display: flex;
    gap: 8px;
    animation: cb-msgIn 240ms cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cb-msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .chatbot-msg-row--user {
    flex-direction: row-reverse;
  }

  /* ── Avatar ── */
  .chatbot-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #F5ECE0;
    border: 1px solid rgba(199,101,45,.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    align-self: flex-end;
  }

  /* ── Bubble ── */
  .chatbot-bubble {
    max-width: 78%;
    padding: 10px 14px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .chatbot-bubble--user {
    background: linear-gradient(135deg, var(--cb-ember) 0%, var(--cb-ember-deep) 100%);
    border-radius: 16px 4px 16px 16px;
    box-shadow: 0 2px 10px rgba(199, 101, 45, 0.25);
  }
  .chatbot-bubble--assistant {
    background: var(--cb-card);
    border: 1px solid var(--cb-line);
    border-radius: 4px 16px 16px 16px;
    box-shadow: 0 2px 8px rgba(53, 36, 26, 0.05);
  }
  .chatbot-bubble__text {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .chatbot-bubble--user   .chatbot-bubble__text { color: #fff; }
  .chatbot-bubble--assistant .chatbot-bubble__text { color: var(--cb-ink); }

  .chatbot-bubble__time {
    font-size: 10.5px;
    align-self: flex-end;
  }
  .chatbot-bubble--user .chatbot-bubble__time { color: rgba(255,255,255,.75); }
  .chatbot-bubble--assistant .chatbot-bubble__time { color: var(--cb-ink-muted); }

  /* ── Typing Indicator ── */
  .chatbot-typing {
    display: flex !important;
    flex-direction: row !important;
    align-items: center;
    gap: 5px;
    padding: 12px 16px;
    max-width: 70px;
    min-height: 40px;
    justify-content: center;
    background: var(--cb-card) !important;
    border: 1px solid var(--cb-line) !important;
  }
  .chatbot-typing span {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cb-ember);
    animation: cb-bounce 1.3s ease-in-out infinite;
  }
  .chatbot-typing span:nth-child(2) { animation-delay: .18s; }
  .chatbot-typing span:nth-child(3) { animation-delay: .36s; }
  @keyframes cb-bounce {
    0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
    40%          { transform: scale(1.1); opacity: 1;   }
  }

  /* ── Footer ── */
  .chatbot-footer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 14px;
    background: #FDFBF7;
    border-top: 1px solid var(--cb-line);
    flex-shrink: 0;
  }
  .chatbot-input {
    flex: 1;
    background: #FFFFFF;
    border: 1px solid var(--cb-line);
    border-radius: 12px;
    padding: 10px 14px;
    color: var(--cb-ink);
    font-size: 13.5px;
    font-family: inherit;
    line-height: 1.5;
    resize: none;
    transition: border-color 200ms ease, box-shadow 200ms ease;
    min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
    outline: none;
    box-shadow: inset 0 1px 2px rgba(53,36,26,0.04);
  }
  .chatbot-input::placeholder { color: #A89A8E; }
  .chatbot-input:focus {
    border-color: var(--cb-ember);
    box-shadow: 0 0 0 3px rgba(199, 101, 45, 0.15);
  }
  .chatbot-input:disabled { opacity: .5; cursor: not-allowed; }

  .chatbot-send-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
    background: linear-gradient(135deg, var(--cb-ember) 0%, var(--cb-ember-deep) 100%);
    box-shadow: 0 2px 10px rgba(199, 101, 45, 0.28);
    color: #fff;
    padding: 0;
  }
  .chatbot-send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(199, 101, 45, 0.38);
  }
  .chatbot-send-btn:active:not(:disabled) { transform: translateY(0); }
  .chatbot-send-btn:disabled { opacity: .4; cursor: not-allowed; }
  .chatbot-send-btn svg { width: 20px; height: 20px; }

  /* ── FAB ── */
  .chatbot-fab {
    position: fixed;
    bottom: 28px;
    right: 24px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9001;
    background: linear-gradient(135deg, #C7652D 0%, #A94E20 100%);
    box-shadow: 0 6px 24px rgba(199, 101, 45, 0.35), 0 2px 8px rgba(53, 36, 26, 0.12);
    color: #fff;
    padding: 0;
    transition: transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms ease;
  }
  .chatbot-fab:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 12px 32px rgba(199, 101, 45, 0.45), 0 4px 12px rgba(53, 36, 26, 0.16);
  }
  .chatbot-fab:active { transform: scale(0.96); }
  .chatbot-fab--open  { background: linear-gradient(135deg, #4A3B32 0%, #211814 100%); }

  /* Pulse rings */
  .chatbot-fab__pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(199, 101, 45, 0.5);
    animation: cb-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  .chatbot-fab__pulse--delay { animation-delay: 1.2s; }
  @keyframes cb-pulse {
    0%   { transform: scale(1);    opacity: .7; }
    100% { transform: scale(1.65); opacity: 0;  }
  }

  .chatbot-fab__icon {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 240ms cubic-bezier(0.16,1,0.3,1);
  }
  .chatbot-fab__icon--close { transform: rotate(90deg); }
  .chatbot-fab__icon svg { width: 24px; height: 24px; }

  /* ── Mobile adjustments ── */
  @media (max-width: 480px) {
    .chatbot-window {
      right: 12px;
      left: 12px;
      width: auto;
      bottom: 90px;
      height: calc(100dvh - 110px);
      max-height: none;
      border-radius: 20px;
    }
    .chatbot-fab {
      right: 16px;
      bottom: 22px;
    }
  }
`;

export default ChatbotWidget;

