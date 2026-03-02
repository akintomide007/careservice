'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
}

export default function PrintButton({ onClick, text = 'Print Progress Note', className = '' }: PrintButtonProps) {
  const handlePrint = () => {
    // Execute any pre-print callback
    if (onClick) {
      onClick();
    }
    
    // Trigger browser print
    window.print();
  };
  
  return (
    <button
      onClick={handlePrint}
      className={`flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg no-print ${className}`}
      title="Print this progress note"
    >
      <Printer className="w-4 h-4" />
      <span>{text}</span>
    </button>
  );
}
