import React from "react";

interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({ text }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
      {text && <span className="mr-1">{text}</span>}
      <span className="ml-1 flex space-x-1">
        <span className="animate-bounce delay-0">.</span>
        <span className="animate-bounce delay-150">.</span>
        <span className="animate-bounce delay-300">.</span>
      </span>
    </div>
  );
}
