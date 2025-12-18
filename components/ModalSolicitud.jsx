import { useState } from 'react';
import { X, Send, FileText, AlertCircle, Tag } from 'lucide-react';

export default function ModalSolicitud({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        tipo: 'abastecimiento',
        descripcion: '',
        prioridad: 'media'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call or pass to parent
        await onSubmit(formData);
        setLoading(false);
        setFormData({ tipo: 'abastecimiento', descripcion: '', prioridad: 'media' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[75vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <FileText className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Nueva Solicitud</h3>
                            <p className="text-sm text-gray-400">Complete los datos para realizar la solicitud</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body & Footer */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                        {/* Tipo de Solicitud */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Tipo de Solicitud
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-white/50" />
                                </div>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
                                >
                                    <option value="abastecimiento" className="bg-[#1a1f2e]">Registro de Insumo</option>
                                    <option value="abastecimiento" className="bg-[#1a1f2e]">Abastecimiento</option>
                                    <option value="mantenimiento" className="bg-[#1a1f2e]">Mantenimiento</option>
                                    <option value="reporte_falla" className="bg-[#1a1f2e]">Reporte de Falla</option>
                                    <option value="otro" className="bg-[#1a1f2e]">Otro</option>
                                </select>
                            </div>
                        </div>

                        {/* Prioridad */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Prioridad
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <AlertCircle className="h-5 w-5 text-white/50" />
                                </div>
                                <select
                                    value={formData.prioridad}
                                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
                                >
                                    <option value="baja" className="bg-[#1a1f2e]">Baja</option>
                                    <option value="media" className="bg-[#1a1f2e]">Media</option>
                                    <option value="alta" className="bg-[#1a1f2e]">Alta</option>
                                    <option value="urgente" className="bg-[#1a1f2e]">Urgente</option>
                                </select>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                rows={4}
                                className="block w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                                placeholder="Describa el detalle de su solicitud..."
                                required
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-4 border-t border-white/10 bg-[#1a1f2e] shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                            {loading ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
