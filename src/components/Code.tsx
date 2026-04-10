import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeProps {
  children: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function Code({ children, language = 'javascript', showLineNumbers = false }: CodeProps) {
  return (
    <div className="my-6">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          borderRadius: '8px',
          padding: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          margin: 0,
        }}
        showLineNumbers={showLineNumbers}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
} 