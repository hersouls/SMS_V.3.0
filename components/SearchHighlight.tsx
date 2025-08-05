import React from 'react';

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
}

export function SearchHighlight({ text, query, className }: SearchHighlightProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark
              key={index}
              className="bg-yellow-500/30 text-yellow-200 px-1 rounded"
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
} 