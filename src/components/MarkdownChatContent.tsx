import React from 'react';

interface MarkdownChatContentProps {
  text: string;
  isUser?: boolean;
}

// Parses inline markdown like **bold** into React nodes
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(
        <strong key={keyIdx++} className="font-bold opacity-95 text-inherit">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

export const MarkdownChatContent: React.FC<MarkdownChatContentProps> = ({ text, isUser = false }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Horizontal dividers (--- or ─── or ━━━)
    if (/^[━─—\-_]{3,}$/.test(trimmed)) {
      elements.push(<hr key={`hr-${i}`} className="my-2 border-t border-amber-200/50 opacity-60" />);
      continue;
    }

    // Headings (###, ##, #)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const headingClass =
        level === 1
          ? 'text-base font-extrabold text-amber-950 mt-2 mb-1 pb-1 border-b border-amber-200/40'
          : level === 2
          ? 'text-sm font-extrabold text-amber-900 mt-2 mb-1'
          : 'text-[13.5px] font-bold text-amber-900 mt-1.5 mb-0.5';

      elements.push(
        <div key={`h-${i}`} className={isUser ? 'font-bold' : headingClass}>
          {renderInline(headingText)}
        </div>
      );
      continue;
    }

    // Bullet points (•, -, *)
    const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)$/);
    if (bulletMatch) {
      const content = bulletMatch[2];
      elements.push(
        <div key={`b-${i}`} className="flex items-start gap-1.5 my-0.5 pr-1 text-right">
          <span className={`font-bold shrink-0 leading-relaxed ${isUser ? 'text-white' : 'text-amber-600'}`}>•</span>
          <div className="flex-1 leading-relaxed">{renderInline(content)}</div>
        </div>
      );
      continue;
    }

    // Numbered lists (1., 2.)
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const content = numberedMatch[2];
      elements.push(
        <div key={`n-${i}`} className="flex items-start gap-1.5 my-0.5 pr-1 text-right">
          <span className={`font-bold shrink-0 text-xs mt-0.5 ${isUser ? 'text-white' : 'text-amber-600'}`}>{num}.</span>
          <div className="flex-1 leading-relaxed">{renderInline(content)}</div>
        </div>
      );
      continue;
    }

    // Regular line / paragraph
    elements.push(
      <p key={`p-${i}`} className="my-0.5 leading-relaxed text-right">
        {renderInline(line)}
      </p>
    );
  }

  return <div className="chat-markdown text-right leading-relaxed">{elements}</div>;
};

export default MarkdownChatContent;

