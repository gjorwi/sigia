'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, message, type, time = null }) {
  const [remainingTime, setRemainingTime] = useState(time);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  // Define color based on message type
  const getTypeColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  // Handle the auto-close functionality using requestAnimationFrame
  const updateProgress = useCallback(() => {
    if (!startTimeRef.current || !time) return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const newRemaining = Math.max(0, time - elapsed);

    setRemainingTime(newRemaining);

    if (newRemaining <= 0) {
      setIsClosing(true);
      onClose();
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [time, onClose]);

  // Start/stop the animation based on isOpen and time
  useEffect(() => {
    if (isOpen && time && !isClosing) {
      startTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, time, updateProgress, isClosing]);

  // Reset closing state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setRemainingTime(time);
    }
  }, [isOpen, time]);

  // Calculate progress percentage (0 to 1)
  const progress = time ? 1 - (remainingTime / time) : 0;

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            {time && (
              <div 
                className="h-1 bg-gray-200"
                role="progressbar"
                aria-valuenow={remainingTime}
                aria-valuemin="0"
                aria-valuemax={time}
              >
                <div 
                  className="h-full transition-transform duration-100 ease-linear origin-left"
                  style={{
                    transform: `scaleX(${1 - progress})`,
                    backgroundColor: type === 'error' ? '#ef4444' : 
                                  type === 'success' ? '#10b981' : 
                                  type === 'warning' ? '#f59e0b' : '#3b82f6',
                    width: '100%',
                    transformOrigin: 'left center'
                  }}
                />
              </div>
            )}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6 sm:py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
                {title}
              </div>
            </h3>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div className="mt-2">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
            
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
           {!time && (
            <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
              Aceptar
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
