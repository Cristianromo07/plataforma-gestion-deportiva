import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

const COLORS = ['rojo', 'azul', 'amarillo', 'naranja', 'violeta'];
const DIAS_SEMANA = [
    { id: 1, label: 'L', full: 'Lunes' },
    { id: 2, label: 'M', full: 'Martes' },
    { id: 3, label: 'X', full: 'Miércoles' },
    { id: 4, label: 'J', full: 'Jueves' },
    { id: 5, label: 'V', full: 'Viernes' },
    { id: 6, label: 'S', full: 'Sábado' },
    { id: 0, label: 'D', full: 'Domingo' }
];

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
    onDelete: (id: number) => void;
    initialData: any;
    scenarios: any[];
}

export default function BookingModal({ isOpen, onClose, onSave, onDelete, initialData, scenarios }: BookingModalProps) {
    const [formData, setFormData] = useState<any>({
        escenario_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        color: 'azul',
        nombre_solicitante: '',
        telefono_solicitante: '',
        descripcion_actividad: '',
        repite: 'nunca',
        intervalo: 1,
        dias_semana: [],
        fin_tipo: 'repeticiones',
        fin_fecha: '',
        fin_repeticiones: 12
    });

    const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                escenario_id: initialData.escenario_id || (scenarios[0]?.id || ''),
                fecha: initialData.fecha || '',
                hora_inicio: initialData.hora_inicio || '',
                hora_fin: initialData.hora_fin || '',
                color: initialData.color || 'azul',
                nombre_solicitante: initialData.nombre_solicitante || '',
                telefono_solicitante: initialData.telefono_solicitante || '',
                descripcion_actividad: initialData.descripcion_actividad || '',
                repite: 'nunca',
                intervalo: 1,
                dias_semana: [],
                fin_tipo: 'repeticiones',
                fin_fecha: '',
                fin_repeticiones: 12
            });
        }
    }, [initialData, scenarios]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const toggleDiaSemana = (dia: number) => {
        setFormData((prev: any) => {
            const dias = prev.dias_semana.includes(dia)
                ? prev.dias_semana.filter((d: number) => d !== dia)
                : [...prev.dias_semana, dia];
            return { ...prev, dias_semana: dias };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[1000] border-l border-slate-200 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-4 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xs font-black uppercase tracking-widest">
                        {formData.id ? 'Detalles de Reserva' : 'Nueva Reserva'}
                    </h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar pb-10">
                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Escenario</label>
                            <select
                                name="escenario_id"
                                value={formData.escenario_id}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                required
                            >
                                {scenarios.map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Solicitante</label>
                                <input
                                    type="text"
                                    name="nombre_solicitante"
                                    value={formData.nombre_solicitante}
                                    onChange={handleChange}
                                    placeholder="Nombre completo"
                                    className="w-full rounded-lg border-slate-200 border p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Teléfono</label>
                                <input
                                    type="tel"
                                    name="telefono_solicitante"
                                    value={formData.telefono_solicitante}
                                    onChange={handleChange}
                                    placeholder="3xx..."
                                    className="w-full rounded-lg border-slate-200 border p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Actividad / Descripción</label>
                            <textarea
                                name="descripcion_actividad"
                                value={formData.descripcion_actividad}
                                onChange={handleChange}
                                placeholder="Especifique el tipo de evento..."
                                rows={3}
                                className="w-full rounded-lg border-slate-200 border p-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex-1">
                                <label className="block text-[9px] font-black uppercase text-blue-400 mb-1 tracking-widest">Fecha Evento</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-bold outline-none text-blue-900 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <label className="block text-[9px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Hora Inicio</label>
                                <input
                                    type="time"
                                    name="hora_inicio"
                                    value={formData.hora_inicio}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-bold outline-none text-emerald-900 cursor-pointer"
                                    required
                                />
                            </div>
                            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                                <label className="block text-[9px] font-black uppercase text-rose-400 mb-1 tracking-widest">Hora Finalización</label>
                                <input
                                    type="time"
                                    name="hora_fin"
                                    value={formData.hora_fin}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-bold outline-none text-rose-900 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {!formData.id && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Programar Recurrencia</label>
                                <div className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Opcional</div>
                            </div>
                            <select
                                name="repite"
                                value={formData.repite}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (e.target.value === 'custom') setShowCustomRecurrence(true);
                                    else setShowCustomRecurrence(false);
                                }}
                                className="w-full rounded-lg border-slate-200 border p-2.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="nunca">No se repite</option>
                                <option value="diario">Repetir diario</option>
                                <option value="semanal">Repetir semanal</option>
                                <option value="mensual">Repetir mensual</option>
                                <option value="custom">Personalizado...</option>
                            </select>

                            {(formData.repite !== 'nunca' || showCustomRecurrence) && (
                                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                        <span>Cada</span>
                                        <input
                                            type="number"
                                            name="intervalo"
                                            min="1"
                                            value={formData.intervalo}
                                            onChange={handleChange}
                                            className="w-14 rounded-lg border-slate-200 p-2 text-center font-bold bg-white outline-none focus:border-blue-500"
                                        />
                                        <span className="uppercase text-[10px] tracking-wider">{formData.repite === 'diario' ? 'Días' : formData.repite === 'mensual' ? 'Meses' : 'Semanas'}</span>
                                    </div>

                                    {(formData.repite === 'semanal' || formData.repite === 'custom') && (
                                        <div className="flex justify-between gap-1">
                                            {DIAS_SEMANA.map(dia => (
                                                <button
                                                    key={dia.id}
                                                    type="button"
                                                    onClick={() => toggleDiaSemana(dia.id)}
                                                    className={`w-9 h-9 rounded-xl text-[10px] font-black border transition-all ${formData.dias_semana.includes(dia.id)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                        }`}
                                                    title={dia.full}
                                                >
                                                    {dia.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-slate-200 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="rep-count"
                                                name="fin_tipo"
                                                value="repeticiones"
                                                checked={formData.fin_tipo === 'repeticiones'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <label htmlFor="rep-count" className="flex-1 flex items-center gap-2 text-[10px] font-bold cursor-pointer text-slate-500">
                                                <span>Finaliza tras</span>
                                                <input
                                                    type="number"
                                                    name="fin_repeticiones"
                                                    min="1"
                                                    value={formData.fin_repeticiones}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'repeticiones'}
                                                    className="w-14 rounded-lg border-slate-200 p-1.5 text-center disabled:opacity-30 text-[11px] font-black bg-white"
                                                />
                                                <span>veces</span>
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id="rep-date"
                                                name="fin_tipo"
                                                value="fecha"
                                                checked={formData.fin_tipo === 'fecha'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <label htmlFor="rep-date" className="flex-1 flex items-center gap-2 text-[10px] font-bold cursor-pointer text-slate-500">
                                                <span>Finaliza el día</span>
                                                <input
                                                    type="date"
                                                    name="fin_fecha"
                                                    value={formData.fin_fecha}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'fecha'}
                                                    className="rounded-lg border-slate-200 p-1.5 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-30 text-[10px] bg-white font-bold"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">Etiquetado Visual</label>
                        <div className="flex justify-center gap-4">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125 shadow-md ${formData.color === c ? 'border-slate-800 ring-4 ring-slate-100 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    aria-label={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 shrink-0">
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e as any);
                    }}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black text-xs uppercase shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Save size={16} /> {formData.id ? 'Actualizar Reserva' : 'Guardar Reserva'}
                </button>

                <div className="flex gap-3">
                    {formData.id && (
                        <button
                            type="button"
                            onClick={() => onDelete(formData.id)}
                            className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold text-[10px] uppercase transition-colors border border-rose-100 flex items-center justify-center gap-1.5"
                        >
                            <Trash2 size={12} /> Eliminar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white text-slate-500 rounded-xl hover:bg-slate-50 font-bold text-[10px] uppercase transition-colors border border-slate-200"
                    >
                        Cerrar Panel
                    </button>
                </div>
            </div>
        </div>
    );
}

function getColorHex(colorName: string) {
    const map: any = {
        rojo: '#ef4444',
        azul: '#3b82f6',
        amarillo: '#eab308',
        naranja: '#f97316',
        violeta: '#a855f7'
    };
    return map[colorName] || '#3b82f6';
}
