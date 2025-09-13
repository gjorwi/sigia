import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Cargando...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
