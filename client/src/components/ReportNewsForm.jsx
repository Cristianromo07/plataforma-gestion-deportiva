import React, { useState } from 'react';
import api from '../api';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

export default function ReportNewsForm({ scenarios }) {
    const [formData, setFormData] = useState({
        scenario: scenarios.length > 0 ? scenarios[0].nombre : '',
        scenario_id: scenarios.length > 0 ? scenarios[0].id : '',
        type: 'Mantenimiento Requerido',
        description: ''
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'scenario') {
            const selected = scenarios.find(s => s.nombre === e.target.value);
            setFormData({
                ...formData,
                scenario: e.target.value,
                scenario_id: selected ? selected.id : ''
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Crear preview si es imagen
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('scenario', formData.scenario);
        data.append('scenario_id', formData.scenario_id);
        data.append('type', formData.type);
        data.append('description', formData.description);
        if (file) {
            data.append('archivo', file);
        }

        try {
            await api.post('/novedades', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Novedad registrada correctamente');
            // Reset
            setFormData(prev => ({ ...prev, description: '' }));
            setFile(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
            alert('Error al registrar la novedad: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border-[6px] border-slate-200 shadow-2xl max-w-2xl mx-auto mt-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                    <FileText size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-black uppercase italic leading-none tracking-tighter">Reportar Novedad</h2>
                    <p className="text-slate-500 font-bold text-sm mt-1">Gestión Técnica de Escenarios</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-1">Escenario Deportivo:</label>
                    <select
                        id="scenario"
                        name="scenario"
                        value={formData.scenario}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-black bg-white shadow-sm"
                    >
                        {scenarios.length > 0 ? (
                            scenarios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)
                        ) : (
                            <>
                                <option>Cancha Multifuncional</option>
                                <option>Piscina Olímpica</option>
                                <option>Gimnasio al Aire Libre</option>
                                <option>Otro</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Novedad:</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-bold text-black bg-white shadow-sm"
                    >
                        <option>Mantenimiento Requerido</option>
                        <option>Daño de infraestructura</option>
                        <option>Insumos faltantes</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Novedad:</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium text-slate-700"
                        placeholder="Detalle la novedad aquí (ej: falla eléctrica, daño en malla, etc.)"
                        required
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Adjuntar Foto o Video (Opcional):</label>
                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {file ? (
                                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                        <CheckCircle size={20} />
                                        <span>{file.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-500 font-semibold">Toca para subir un archivo</p>
                                        <p className="text-xs text-slate-400 italic">PNG, JPG o Video (Max. 10MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    {preview && (
                        <div className="mt-4 relative group">
                            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl shadow-lg border-2 border-white" />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {!preview && file && file.type.startsWith('video/') && (
                        <div className="mt-4 p-4 bg-slate-100 rounded-xl flex items-center gap-3 border-2 border-slate-200">
                            <FileText className="text-blue-500" />
                            <span className="text-sm font-bold text-slate-700">Video: {file.name}</span>
                            <button onClick={() => setFile(null)} className="ml-auto text-slate-400 hover:text-red-500"><X size={18} /></button>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-black hover:scale-[1.02] active:scale-95'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Registrar Novedad
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
