import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  stripEmojis?: boolean;
}

/**
 * Removes emoji characters while strictly preserving newlines (\n), currency symbols (₹, $, €, £),
 * math symbols (+, -, %, =, /), numbers, and standard punctuation.
 */
function removeEmojis(text: string): string {
  if (!text) return '';
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}]/gu,
      ''
    )
    .replace(/[ \t]{2,}/g, ' ');
}

/**
 * Safely parses inline formatting:
 * **bold** -> <strong>
 * `code` -> <code>
 * *italic* -> <em>
 * plain text -> regular text
 */
function renderInlineText(line: string): React.ReactNode {
  if (!line) return null;

  // Split by bold (**...**), code (`...`), or italic (*...*)
  const parts: React.ReactNode[] = [];
  // Tokenize using regex with capturing groups
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      parts.push(line.slice(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-[#1E1E2A]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-[#FAF9FD] border border-[#ECE8F5] font-mono text-[11px] text-[#7E69AB]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-[#4A4A5A]">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(token);
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < line.length) {
    parts.push(line.slice(lastIdx));
  }

  return parts.length > 0 ? parts : line;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  stripEmojis = true,
}) => {
  const sanitized = stripEmojis ? removeEmojis(content) : content;
  const lines = sanitized.split(/\r?\n/);

  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'ordered'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const listKey = `list-${elements.length}`;
    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={listKey} className="my-2 space-y-1 pl-4 list-disc marker:text-[#7E69AB] text-[#2D2D3A] text-xs sm:text-sm font-normal">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={listKey} className="my-2 space-y-1 pl-4 list-decimal marker:text-[#7E69AB] marker:font-semibold text-[#2D2D3A] text-xs sm:text-sm font-normal">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineText(item)}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line separates paragraphs
    if (!trimmed) {
      flushList();
      continue;
    }

    // Dividers
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-2.5 border-t border-[#ECE8F5]" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm font-semibold text-[#2D2D3A] mt-2.5 mb-1 tracking-tight">
          {renderInlineText(trimmed.slice(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h5 key={`h4-${i}`} className="text-xs font-semibold text-[#6B6B7B] mt-2 mb-0.5 uppercase tracking-wide">
          {renderInlineText(trimmed.slice(5))}
        </h5>
      );
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-1.5 pl-3 border-l-2 border-[#7E69AB] bg-[#FAF9FD] py-1 text-xs italic text-[#4A4A5A] rounded-r-md"
        >
          {renderInlineText(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet lists (- or * or •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists (1. or 2.)
    const numberMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'ordered') {
        flushList();
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // Standard paragraph line
    flushList();
    elements.push(
      <p key={`p-${i}`} className="mb-2 leading-relaxed text-[#2D2D3A] font-normal text-xs sm:text-sm">
        {renderInlineText(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 font-normal text-[#2D2D3A] ${className}`}>{elements}</div>;
};
