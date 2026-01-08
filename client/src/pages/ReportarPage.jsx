import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import ReportNewsForm from '../components/ReportNewsForm';
import api from '../api';

export default function ReportarPage() {
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState([]);

    useEffect(() => {
        api.get('/escenarios').then(res => setScenarios(res.data));
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 font-medium">
            <header className="bg-white border-b-4 border-slate-300 p-6 flex items-center justify-between shadow-lg sticky top-0 z-50">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios')}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all border-2 border-slate-200 shadow-sm"
                    >
                        <ArrowLeft size={24} className="text-black" />
                    </button>
                    <h1 className="text-2xl font-black text-black uppercase italic tracking-tighter decoration-blue-500 underline">Reportar Novedad</h1>
                </div>

                <button
                    onClick={() => navigate('/subgerencia-escenarios/novedades')}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black text-[12px] uppercase hover:bg-slate-900 transition-all shadow-xl"
                >
                    Ver Historial
                </button>
            </header>

            <main className="p-8">
                <ReportNewsForm scenarios={scenarios} />
            </main>
        </div>
    );
}
