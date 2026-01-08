import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import BookingModal from '../components/BookingModal';
import { ArrowLeft, Plus, History, Clock, FileText, Calendar } from 'lucide-react';

export default function SubgerenciaPage({ user }) {
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [filterScenario, setFilterScenario] = useState('');

    const calendarRef = useRef(null);

    useEffect(() => {
        // Cargar escenarios
        api.get('/escenarios').then(res => {
            setScenarios(res.data);
            if (res.data.length > 0) {
                setFilterScenario(res.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [filterScenario]);

    const fetchEvents = async () => {
        if (!filterScenario) return;
        try {
            const res = await api.get('/reservas', {
                params: { escenario_id: filterScenario }
            });

            const mappedEvents = res.data.map(r => ({
                id: r.id,
                title: `${r.descripcion_actividad || 'Sin descripción'} - ${r.nombre_solicitante || r.usuario_email}`,
                start: `${r.fecha.split('T')[0]}T${r.hora_inicio}`,
                end: `${r.fecha.split('T')[0]}T${r.hora_fin}`,
                backgroundColor: getColorHex(r.color),
                borderColor: getColorHex(r.color),
                extendedProps: { ...r }
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDateSelect = (selectInfo) => {
        const startStr = selectInfo.startStr;
        const endStr = selectInfo.endStr;
        const dateObj = new Date(startStr);
        const date = dateObj.toISOString().split('T')[0];
        const startTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);
        const endTime = new Date(endStr).toTimeString().split(' ')[0].substring(0, 5);

        setCurrentEvent({
            escenario_id: filterScenario,
            fecha: date,
            hora_inicio: startTime,
            hora_fin: endTime,
            color: 'azul'
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const props = clickInfo.event.extendedProps;
        setCurrentEvent({
            id: props.id,
            escenario_id: props.escenario_id,
            fecha: props.fecha.split('T')[0],
            hora_inicio: props.hora_inicio,
            hora_fin: props.hora_fin,
            color: props.color,
            nombre_solicitante: props.nombre_solicitante,
            telefono_solicitante: props.telefono_solicitante,
            descripcion_actividad: props.descripcion_actividad
        });
        setIsModalOpen(true);
    };

    const saveBooking = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/reservas/${formData.id}`, formData);
                alert('Reserva actualizada');
            } else {
                const res = await api.post('/reservas', formData);
                alert(res.data.message || 'Reserva(s) creada(s) con éxito!');
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al procesar la reserva');
        }
    };

    const deleteBooking = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
        try {
            await api.delete(`/reservas/${id}`);
            setIsModalOpen(false);
            fetchEvents();
            alert('Reserva eliminada');
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-medium text-black">
            {/* Header Moderno Estilo Premium */}
            <header className="h-[80px] bg-white border-b-4 border-slate-300 px-6 flex items-center justify-between shadow-lg z-50">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-200 shadow-sm"
                    >
                        <ArrowLeft size={22} className="text-black" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-black uppercase italic leading-none tracking-tighter underline decoration-blue-500">
                            Subgerencia Escenarios
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calendario en Vivo</span>
                        </div>
                    </div>
                </div>

                {/* Filtro Integrado en el Header */}
                <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl border-2 border-slate-300 shadow-inner">
                    <select
                        className="bg-white border border-slate-300 rounded-xl text-[13px] font-black px-6 py-2 outline-none text-black shadow-sm min-w-[250px]"
                        value={filterScenario}
                        onChange={(e) => setFilterScenario(e.target.value)}
                    >
                        <option value="">Seleccione Escenario...</option>
                        {scenarios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/reportar')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase hover:bg-red-700 transition-all shadow-xl"
                    >
                        <Plus size={18} /> Reportar Novedad
                    </button>
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/novedades')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase hover:bg-black transition-all shadow-xl"
                    >
                        <History size={18} /> Ver Novedades
                    </button>
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/horario-gestor')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase hover:bg-blue-800 transition-all shadow-xl"
                    >
                        <Clock size={18} /> Horario Gestor
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="bg-white rounded-[2rem] border-[6px] border-slate-300 shadow-2xl h-full p-6 overflow-auto">
                    {!filterScenario ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30">
                            <Calendar size={80} className="text-slate-400" strokeWidth={1} />
                            <p className="font-black text-2xl uppercase tracking-[0.2em] text-center max-w-md">
                                Seleccione un escenario para visualizar el calendario
                            </p>
                        </div>
                    ) : (
                        <div className="h-full calendar-premium">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek'
                                }}
                                buttonText={{
                                    today: 'Hoy',
                                    month: 'Mes',
                                    week: 'Semana'
                                }}
                                locale="es"
                                slotMinTime="06:00:00"
                                slotMaxTime="23:00:00"
                                allDaySlot={false}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                weekends={true}
                                events={events}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                height="100%"
                            />
                        </div>
                    )}
                </div>
            </main>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveBooking}
                onDelete={deleteBooking}
                initialData={currentEvent}
                scenarios={scenarios}
            />

            <style>{`
                .calendar-premium .fc {
                    --fc-border-color: #e2e8f0;
                    --fc-today-bg-color: #f8fafc;
                    --fc-button-bg-color: #0f172a;
                    --fc-button-border-color: #0f172a;
                    --fc-button-hover-bg-color: #1e293b;
                    --fc-button-active-bg-color: #3b82f6;
                    font-family: inherit;
                }
                .calendar-premium .fc-toolbar-title {
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    font-style: italic;
                    font-size: 1.5rem !important;
                    letter-spacing: -0.05em;
                }
                .calendar-premium .fc-button {
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-weight: 900 !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                }
                .calendar-premium .fc-col-header-cell {
                    padding: 15px 0 !important;
                    background: #f8fafc;
                    border-bottom: 4px solid #334155 !important;
                }
                .calendar-premium .fc-col-header-cell-cushion {
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    color: #64748b;
                    font-size: 12px;
                }
                .calendar-premium .fc-timegrid-slot {
                    height: 3rem !important;
                }
                .calendar-premium .fc-event {
                    border-radius: 8px !important;
                    border: none !important;
                    padding: 4px !important;
                    font-weight: 900 !important;
                    font-size: 10px !important;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    text-transform: uppercase;
                }
            `}</style>
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
