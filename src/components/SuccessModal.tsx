import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoCloseDuration?: number; // in milliseconds, default 3000
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message,
  autoCloseDuration = 3000 
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  return (
    <>
      
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in"
          onClick={(e) => e.stopPropagation()}
        >
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>

          
          <div className="p-8 text-center">
            
            <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 animate-in zoom-in duration-700" />
              </div>
            </div>

            
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              {title}
            </h3>

            
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>

            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#161950] text-white font-semibold rounded-lg hover:bg-[#161950]/90 transition-all duration-200 hover:shadow-lg"
            >
              Continue
            </button>
          </div>

          
          {autoCloseDuration > 0 && (
            <div className="h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-green-500 animate-progress"
                style={{
                  animation: `progress ${autoCloseDuration}ms linear`
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoom-in {
          from {
            transform: scale(0.95);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .zoom-in {
          animation: zoom-in 0.3s ease-out;
        }

        .duration-300 {
          animation-duration: 300ms;
        }

        .duration-500 {
          animation-duration: 500ms;
        }

        .duration-700 {
          animation-duration: 700ms;
        }

        .animate-progress {
          width: 100%;
        }
      `}</style>
    </>
  );
}
