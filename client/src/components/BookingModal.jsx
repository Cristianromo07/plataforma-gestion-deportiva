import React, { useState, useEffect } from 'react';

const COLORS = ['rojo', 'azul', 'amarillo', 'naranja', 'violeta'];

export default function BookingModal({ isOpen, onClose, onSave, onDelete, initialData, scenarios }) {
    const [formData, setFormData] = useState({
        escenario_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        color: 'azul'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                escenario_id: initialData.escenario_id || (scenarios[0]?.id || ''),
                fecha: initialData.fecha || '',
                hora_inicio: initialData.hora_inicio || '',
                hora_fin: initialData.hora_fin || '',
                color: initialData.color || 'azul'
            });
        } else {
            // Reset form for new entry
            setFormData(prev => ({
                ...prev,
                escenario_id: scenarios[0]?.id || '',
            }));
        }
    }, [initialData, scenarios]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                    {initialData?.id ? 'Editar Reserva' : 'Nueva Reserva'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Escenario</label>
                        <select
                            name="escenario_id"
                            value={formData.escenario_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            {scenarios.map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color (Tipo)</label>
                        <div className="flex gap-2 mt-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? 'border-black' : 'border-transparent'}`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    aria-label={c}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        {initialData?.id && (
                            <button
                                type="button"
                                onClick={() => onDelete(initialData.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-auto"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getColorHex(colorName) {
    switch (colorName) {
        case 'rojo': return '#ef4444';
        case 'azul': return '#3b82f6';
        case 'amarillo': return '#eab308';
        case 'naranja': return '#f97316';
        case 'violeta': return '#a855f7';
        default: return '#3b82f6';
    }
}
