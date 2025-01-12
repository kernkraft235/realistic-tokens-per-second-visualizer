import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const processMarkdown = (text) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let result = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      result.push(
        <span key={lastIndex} className="text-white">
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // Add code block
    result.push(
      <div key={match.index} className="my-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
        <pre className="text-white">
          <code>{match[2]}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(
      <span key={lastIndex} className="text-white">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return result;
};

const TokensPerSecondVisualizer = () => {
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tps, setTps] = useState('');
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const messageContent = `Let me explain how React's virtual DOM helps optimize performance in web applications. The virtual DOM is a lightweight copy of the actual DOM that React maintains in memory.

When state changes occur in a React application, instead of directly manipulating the real DOM (which is computationally expensive), React first updates its virtual DOM and then compares it with the previous version to determine the minimal set of changes needed.

Here's a simple example of how React components work with state:

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

Some key benefits of using React's virtual DOM include:

- Improved performance through batch updates
- Automatic handling of DOM manipulation
- Cross-platform compatibility
- Simplified debugging process
- Better memory management

The reconciliation process, which is React's algorithm for diffing one tree with another, ensures that component updates are predictable while being fast enough for high-performance applications.`;

let currentPosition = 0;

const generateMarkdownContent = () => {
  const chunkSize = Math.floor(Math.random() * 3) + 2;
  const chunk = messageContent.slice(currentPosition, currentPosition + chunkSize);
  currentPosition = (currentPosition + chunkSize) % messageContent.length;
  if (currentPosition >= messageContent.length - chunkSize) {
    currentPosition = 0;
  }
  return chunk;
};

  const start = () => {
    if (!tps || isNaN(parseInt(tps))) return;
    
    setIsGenerating(true);
    setOutput('');
    const tokensPerSecond = parseInt(tps);
    const delay = 1000 / tokensPerSecond;

    const updateOutput = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= delay) {
        setOutput(prev => prev + generateMarkdownContent());
        lastUpdateRef.current = now;
      }
    };

    intervalRef.current = setInterval(updateOutput, delay);
  };

  const stop = () => {
    setIsGenerating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-4 min-h-screen bg-zinc-900">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-semibold text-white">Tokens Per Second Visualizer</h1>
        <div className="flex space-x-2">
          <input
            type="number"
            value={tps}
            onChange={(e) => setTps(e.target.value)}
            className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white px-4 py-2"
            placeholder="Enter tokens per second"
          />
          <button
            onClick={isGenerating ? stop : start}
            className={`px-4 py-2 rounded-lg font-medium ${
              isGenerating 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {isGenerating ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      
      <Card className="flex-1 bg-zinc-800 border-zinc-700 relative">
        <CardContent className="p-4 h-96">
          <div 
            className="font-mono text-sm whitespace-pre-wrap absolute inset-4 overflow-y-auto"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {processMarkdown(output)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokensPerSecondVisualizer;
