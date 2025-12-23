
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface NotificationPopupProps {
  message: string;
  type: 'success' | 'error';
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ message, type }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600' : 'bg-red-600';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center p-4 rounded-lg text-white shadow-lg z-50 ${bgColor} animate-fade-in-up`}
    >
      <Icon className="w-6 h-6 mr-3" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default NotificationPopup;
