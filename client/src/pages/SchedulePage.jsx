import React from 'react';
import { Link } from 'react-router-dom';

export default function SchedulePage() {
    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Mi Horario Laboral 📅</h1>
            <p className="text-gray-600 mb-6">Subgerencia de Escenarios Deportivos</p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Día</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Entrada</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Salida</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Lugar / Actividad</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[
                            { day: 'Lunes', in: '7:00 AM', out: '4:00 PM', activity: 'Oficina Central' },
                            { day: 'Martes', in: '8:00 AM', out: '5:00 PM', activity: 'Supervisión - Polideportivo' },
                            { day: 'Miércoles', in: '7:00 AM', out: '4:00 PM', activity: 'Oficina Central' },
                            { day: 'Jueves', in: '8:00 AM', out: '5:00 PM', activity: 'Supervisión - Canchas Sur' },
                            { day: 'Viernes', in: '7:00 AM', out: '3:00 PM', activity: 'Reunión Equipo / Oficina' },
                            { day: 'Sábado', in: '-', out: '-', activity: 'Descanso' },
                        ].map((row, idx) => (
                            <tr key={row.day} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.day}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.in}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.out}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.activity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-6 text-sm">
                <Link to="/profile" className="text-blue-600 hover:underline">← Volver al Perfil</Link>
            </p>
        </div>
    );
}
