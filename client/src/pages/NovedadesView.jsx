import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Eye, MapPin, Clock, Download } from 'lucide-react';
import api from '../api';

export default function NovedadesView() {
    const navigate = useNavigate();
    const [novedades, setNovedades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNovedades = async () => {
            try {
                const res = await api.get('/novedades');
                setNovedades(res.data);
            } catch (err) {
                console.error("Error al cargar novedades:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNovedades();
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 font-medium text-slate-800">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios')}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl shadow-lg border-2 border-slate-200 transition-all active:scale-95"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-black uppercase italic tracking-tighter leading-none">Historial de Novedades</h1>
                        <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Reportes de Infraestructura y Gestión</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Cargando reportes...</p>
                    </div>
                ) : novedades.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border-4 border-dashed border-slate-200">
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-black text-slate-400 uppercase">No hay reportes registrados aún</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {novedades.map((n) => (
                            <div key={n.id} className="bg-white rounded-[2.5rem] overflow-hidden border-4 border-slate-200 shadow-xl flex flex-col transition-all hover:scale-[1.02] hover:shadow-2xl">
                                {/* Media Preview */}
                                {n.archivo_url ? (
                                    <div className="h-48 bg-slate-200 relative">
                                        {n.archivo_url.match(/\.(mp4|mov|avi)$/i) ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white gap-2">
                                                <Download size={32} className="text-blue-400" />
                                                <span className="text-xs font-black uppercase tracking-widest">Video Adjunto</span>
                                            </div>
                                        ) : (
                                            <img
                                                src={n.archivo_url}
                                                alt="Evidencia"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-4 right-4 group">
                                            <a
                                                href={n.archivo_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-white/90 backdrop-blur p-2 rounded-full text-slate-900 shadow-lg hover:bg-black hover:text-white transition-all inline-block"
                                            >
                                                <Eye size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 bg-slate-50 flex flex-col items-center justify-center border-b-2 border-slate-100">
                                        <FileText size={48} className="text-slate-200" />
                                        <span className="text-xs font-black text-slate-300 uppercase mt-2">Sin evidencia visual</span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${n.tipo === 'Mantenimiento Requerido' ? 'bg-amber-100 text-amber-700' :
                                                n.tipo === 'Daño de infraestructura' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {n.tipo}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase ml-auto flex items-center gap-1">
                                            <Calendar size={12} /> {formatDate(n.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="font-black text-lg text-black uppercase leading-tight mb-2 flex items-start gap-2">
                                        <MapPin size={18} className="text-blue-600 mt-1 shrink-0" />
                                        {n.escenario_nombre}
                                    </h3>

                                    <p className="text-slate-600 text-sm font-medium line-clamp-3 mb-4 italic">
                                        "{n.descripcion}"
                                    </p>

                                    <div className="mt-auto pt-4 border-t-2 border-slate-50 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                            ID
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Reportado por</p>
                                            <p className="text-sm font-black text-slate-800">Sistema Ref: #{n.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
