import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md border border-zinc-800 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-red-600 flex items-center"><AlertTriangle className="mr-2"/>{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-zinc-300">{message}</p>
        </div>
        <div className="p-4 bg-zinc-900/50 flex justify-end space-x-3 rounded-b-lg">
            <button
                onClick={onClose}
                className="bg-zinc-700 text-white font-bold py-2 px-6 rounded-md hover:bg-zinc-600 transition-colors"
            >
                {cancelText}
            </button>
            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-800 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <span>{confirmText}</span>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;