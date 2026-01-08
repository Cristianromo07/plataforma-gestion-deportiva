import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import XLSX from 'xlsx-js-style';
import { Search, Plus, UserPlus, Trash2, Edit2, Save, ArrowLeft, X, Shield, Phone, AlertTriangle, AlertCircle, FileDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
import { normalize } from '../utils/stringUtils';

const TURNO_PRESETS = [
    "6:00 1:30",
    "2:30 10:00",
    "DESCANSO",
    "INCAPACITADA",
    "VACACIONES",
    "CICLOVIA",
    "D. PROGRAMADO"
];

// Scenarios will be loaded from DB



export default function HorarioGestor() {
    const navigate = useNavigate();
    const { date: routeDate } = useParams();

    // Helper to get Monday of a week
    const getMonday = (d) => {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };

    const [currentWeek, setCurrentWeek] = useState(routeDate ? getMonday(routeDate) : getMonday(new Date()));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEscenario, setSelectedEscenario] = useState('Todos');
    const [filterEmpty, setFilterEmpty] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReplacementModal, setShowReplacementModal] = useState(false);
    const [activeGap, setActiveGap] = useState(null);
    const [error, setError] = useState(null);

    const [data, setData] = useState([]);
    const [allEscenarios, setAllEscenarios] = useState([]);
    const [allowedEscenarios, setAllowedEscenarios] = useState([]);
    const [dirtyRows, setDirtyRows] = useState(new Set());
    const [newGestor, setNewGestor] = useState({ nombre: '', contacto: '', escenario: '' });

    useEffect(() => {
        if (routeDate) {
            const mon = getMonday(routeDate);
            if (mon !== currentWeek) setCurrentWeek(mon);
        }
    }, [routeDate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [escResponse, horarioResponse] = await Promise.all([
                api.get('/escenarios'),
                api.get(`/horarios?date=${currentWeek}`)
            ]);

            const fetchedEscenarios = escResponse.data;
            setAllEscenarios(fetchedEscenarios);
            // Extract names for the dropdown
            setAllowedEscenarios(fetchedEscenarios.map(e => e.nombre));
            const dbData = horarioResponse.data;



            const structured = fetchedEscenarios.map(esc => {
                // Robust matching by ID
                const gestoresMatches = dbData.filter(d => d.escenario_id === esc.id);

                return {
                    escenario: esc.nombre,
                    gestores: gestoresMatches.map(d => ({
                        id: d.id,
                        nombre: d.gestor_nombre,
                        contacto: d.contacto,
                        turnos: [d.lunes, d.martes, d.miercoles, d.jueves, d.viernes, d.sabado, d.domingo].map(t => t || "")
                    }))
                };
            });

            setData(structured);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Error al cargar datos: " + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentWeek]);

    const changeWeek = (offset) => {
        const d = new Date(currentWeek);
        d.setDate(d.getDate() + (offset * 7));
        const newMon = getMonday(d);
        navigate(`/subgerencia-escenarios/horario-gestor/${newMon}`);
    };

    const dataWithGaps = useMemo(() => {
        return data.map(item => {
            const gaps = [];
            if (normalize(item.escenario) !== 'ciclovia') {
                for (let i = 0; i < 7; i++) {
                    ['MAÑANA', 'TARDE'].forEach(shift => {
                        const shiftKey = shift === 'MAÑANA' ? '6:00' : '2:30';
                        const directCover = item.gestores.some(g => (g.turnos[i] || '').toUpperCase().includes(shiftKey));

                        let crossCover = false;
                        if (!directCover) {
                            data.forEach(otherEsc => {
                                otherEsc.gestores.forEach(g => {
                                    const t = (g.turnos[i] || '').toUpperCase();
                                    if (t.includes(shiftKey) && t.includes(item.escenario.toUpperCase())) {
                                        crossCover = true;
                                    }
                                });
                            });
                        }

                        if (!directCover && !crossCover) {
                            gaps.push({ day: i, shift: shift });
                        }
                    });
                }
            }
            return { ...item, gaps };
        });
    }, [data]);

    const filteredData = useMemo(() => {
        return dataWithGaps.map(item => {
            const isCicloviaFilter = selectedEscenario === 'Ciclovía';
            const filteredG = item.gestores.filter(g => {
                const searchLower = searchTerm.toLowerCase();
                const matchesName = g.nombre.toLowerCase().includes(searchLower);
                const matchesTurno = g.turnos.some(t => (t || '').toLowerCase().includes(searchLower));

                if (!matchesName && !matchesTurno) return false;

                if (isCicloviaFilter) {
                    const hasCicloviaTurn = g.turnos.some(t => t.toUpperCase().includes('CICLOVIA'));
                    const isCicloviaEsc = normalize(item.escenario) === 'ciclovia';
                    return hasCicloviaTurn || isCicloviaEsc;
                }
                return true;
            });

            if (selectedEscenario !== 'Todos' && !isCicloviaFilter && item.escenario !== selectedEscenario) return null;
            if (isCicloviaFilter && filteredG.length === 0) return null;

            const hasGaps = item.gaps.length > 0;
            const isTotallyEmpty = item.gestores.length === 0;

            // Lógica de visibilidad rigurosa:
            if (searchTerm !== '') {
                // Si estamos buscando, solo mostramos si hay gestores que coincidan
                if (filteredG.length === 0) return null;
            } else if (filterEmpty) {
                // Si el filtro de vacantes está activo, solo mostramos los que tienen huecos
                if (!hasGaps) return null;
            } else {
                // HIDE row if it has no gestores AND it is already covered by cross-management (no gaps)
                if (isTotallyEmpty && !hasGaps) return null;
                // Por defecto, ocultamos los que están totalmente vacíos (0 gestores en la DB)
                if (isTotallyEmpty) return null;
            }

            return { ...item, gestores: filteredG };
        }).filter(Boolean);
    }, [dataWithGaps, searchTerm, selectedEscenario, filterEmpty]);

    const emptyCount = useMemo(() => dataWithGaps.filter(e => e.gaps.length > 0).length, [dataWithGaps]);

    const handleUpdate = (escIdx, gIdx, field, val, dayIdx = null) => {
        const newData = [...data];
        const actualEscIdx = data.findIndex(e => e.escenario === data[escIdx].escenario);
        if (dayIdx !== null) {
            newData[actualEscIdx].gestores[gIdx].turnos[dayIdx] = val;
        } else {
            newData[actualEscIdx].gestores[gIdx][field] = val;
        }
        setData([...newData]);
        setDirtyRows(prev => new Set(prev).add(`${newData[actualEscIdx].escenario}-${newData[actualEscIdx].gestores[gIdx].nombre}`));
    };

    const handleSave = async () => {
        const toSave = [];
        data.forEach(esc => {
            const escMaster = allEscenarios.find(e => e.nombre === esc.escenario);
            esc.gestores.forEach(g => {
                if (dirtyRows.has(`${esc.escenario}-${g.nombre}`)) {
                    toSave.push({
                        escenario: esc.escenario,
                        escenario_id: escMaster?.id,
                        gestor_nombre: g.nombre,
                        contacto: g.contacto,
                        turnos: g.turnos,
                        fecha_inicio: currentWeek
                    });
                }
            });
        });
        if (toSave.length === 0) return setIsEditMode(false);
        try {
            await api.post('/horarios', { entries: toSave });
            setDirtyRows(new Set());
            setIsEditMode(false);
            alert("Cambios guardados con éxito.");
            loadData(); // RECARGAR PARA ASEGURAR SINCRONÍA
        } catch (err) { alert("Error al guardar: " + (err.response?.data?.error || err.message)); }
    };

    const handleDelete = async (esc, nom) => {
        if (!window.confirm(`¿Seguro que quieres eliminar a ${nom}?`)) return;
        try {
            await api.delete(`/horarios/${encodeURIComponent(esc)}/${encodeURIComponent(nom)}`);
            loadData();
        } catch (e) { alert("Error al eliminar."); }
    };

    const handleAdd = async () => {
        if (!newGestor.nombre || !newGestor.escenario) return alert("Nombre y Sede son obligatorios");

        const escMaster = allEscenarios.find(e => e.nombre === newGestor.escenario);

        const entry = {
            escenario: newGestor.escenario,
            escenario_id: escMaster?.id,
            gestor_nombre: newGestor.nombre.toUpperCase(),
            contacto: newGestor.contacto,
            turnos: ["", "", "", "", "", "", ""],
            fecha_inicio: currentWeek
        };

        try {
            await api.post('/horarios', { entries: [entry] });
            alert("Gestor registrado y guardado en base de datos.");
            setShowAddModal(false);
            setNewGestor({ nombre: '', contacto: '', escenario: '' });
            loadData();
        } catch (err) {
            alert("Error al registrar: " + (err.response?.data?.error || err.message));
        }
    };

    const handleAssignReplacement = async (gestor) => {
        if (!activeGap) return;

        let sourceEntry = null;
        for (const esc of data) {
            const found = esc.gestores.find(g => g.nombre === gestor.nombre);
            if (found) {
                sourceEntry = { ...found, escName: esc.escenario, escId: esc.id };
                break;
            }
        }

        if (!sourceEntry) return;

        const baseShift = activeGap.shift === 'MAÑANA' ? '6:00 1:30' : '2:30 10:00';
        const newTurnos = [...sourceEntry.turnos];
        const currentVal = (newTurnos[activeGap.day] || '');

        if (currentVal.toUpperCase().includes(baseShift)) {
            newTurnos[activeGap.day] = `${currentVal} ${activeGap.escenario.toUpperCase()}+`;
        } else {
            newTurnos[activeGap.day] = `${baseShift} ${activeGap.escenario.toUpperCase()}+`;
        }

        const payload = {
            id: sourceEntry.id,
            escenario: sourceEntry.escName,
            escenario_id: sourceEntry.escId,
            gestor_nombre: sourceEntry.nombre,
            contacto: sourceEntry.contacto,
            turnos: newTurnos,
            fecha_inicio: currentWeek
        };

        try {
            await api.post('/horarios', { entries: [payload] });
            alert(`Sustitución consolidada en ${gestor.nombre}`);
            setShowReplacementModal(false);
            setActiveGap(null);
            loadData();
        } catch (err) {
            alert("Error: " + (err.response?.data?.error || err.message));
        }
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Header styling
        const titleStyle = {
            font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
            alignment: { horizontal: "center", vertical: "center" }
        };

        const headerStyle = {
            fill: { fgColor: { rgb: "0F172A" } },
            font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "475569" } },
                bottom: { style: "thin", color: { rgb: "475569" } },
                left: { style: "thin", color: { rgb: "475569" } },
                right: { style: "thin", color: { rgb: "475569" } }
            }
        };

        const cellStyle = (isEven) => ({
            fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F1F5F9" } },
            font: { color: { rgb: "000000" }, sz: 9 },
            alignment: { vertical: "center" },
            border: {
                bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                right: { style: "thin", color: { rgb: "E2E8F0" } }
            }
        });

        const headers = ["SEDE", "FUNCIONARIO", "TELÉFONO", ...DAYS.map(d => d.toUpperCase())];
        const dataRows = [];

        // Build Rows
        filteredData.forEach((item, escIdx) => {
            item.gestores.forEach(g => {
                const row = [
                    { v: item.escenario, s: cellStyle(escIdx % 2 === 0) },
                    { v: g.nombre, s: { ...cellStyle(escIdx % 2 === 0), font: { bold: true, sz: 9 } } },
                    { v: g.contacto || '---', s: cellStyle(escIdx % 2 === 0) },
                    ...g.turnos.map(t => ({ v: t || '---', s: { ...cellStyle(escIdx % 2 === 0), alignment: { horizontal: "center" } } }))
                ];
                dataRows.push(row);
            });
        });

        if (dataRows.length === 0) return alert("No hay datos");

        // Format dates for title
        const weekStart = new Date(currentWeek + 'T00:00:00');
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekRange = `SEMANA DEL ${weekStart.toLocaleDateString()} AL ${weekEnd.toLocaleDateString()}`;

        const ws = XLSX.utils.aoa_to_sheet([
            [{ v: `PLANILLA DE HORARIOS - ${weekRange}`, s: titleStyle }],
            [], // Espacio
            headers.map(h => ({ v: h, s: headerStyle })),
            ...dataRows
        ]);

        // Combinar celdas para el título
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];

        ws['!cols'] = [
            { wch: 25 }, { wch: 30 }, { wch: 15 },
            ...DAYS.map(() => ({ wch: 25 }))
        ];
        ws['!rows'] = [{ hpt: 30 }, { hpt: 10 }, { hpt: 30 }, ...dataRows.map(() => ({ hpt: 25 }))];

        XLSX.utils.book_append_sheet(wb, ws, "Horarios");
        XLSX.writeFile(wb, `Planilla_Horarios_${currentWeek}.xlsx`);
    };

    const getTurnoStyle = (t) => {
        const v = (t || '').toUpperCase();
        if (!v) return 'bg-white text-slate-300';
        if (v.includes('DESCANSO')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (v.includes('INCAPACITADA')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (v.includes('VACACIONES')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (v.includes('CICLOVIA')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (v.includes('D. PROGRAMADO')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        const isBase = (v.includes('6:00') || v.includes('2:30'));
        if (isBase) return 'bg-white text-black border-slate-200';
        return 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm';
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden text-black font-medium">
            <header className="h-[56px] bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200">
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Horario Gestor</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200 shadow-sm">
                        <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={18} /></button>
                        <div className="px-3 flex items-center gap-2 border-x border-slate-100">
                            <Calendar size={13} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Semana del {new Date(currentWeek + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={18} /></button>
                    </div>

                    {emptyCount > 0 && (
                        <button
                            onClick={() => setFilterEmpty(!filterEmpty)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-bold text-[9px] uppercase transition-all ${filterEmpty ? 'bg-orange-600 text-white shadow-md' : 'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                            <AlertTriangle size={12} /> {emptyCount} VACANTES
                        </button>
                    )}

                    <div className="flex items-center gap-1.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                        <div className="relative flex items-center bg-white rounded-md border border-slate-200 px-2 py-1">
                            <Search className="text-slate-300" size={13} />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-[11px] font-bold w-28 outline-none ml-1 text-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-white border border-slate-200 rounded-md text-[10px] font-bold px-2 py-1 outline-none text-slate-600 appearance-none cursor-pointer hover:bg-slate-50" value={selectedEscenario} onChange={e => setSelectedEscenario(e.target.value)}>
                            <option value="Todos">Sedes</option>
                            <option value="Ciclovía">Ciclovía</option>
                            {allowedEscenarios.filter(e => e !== 'Ciclovía').map(esc => <option key={esc} value={esc}>{esc}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileDown size={14} className="text-emerald-600" /> Exportar
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white border border-slate-900 rounded-lg font-bold text-[10px] uppercase hover:bg-slate-900 transition-all shadow-sm">
                        <UserPlus size={14} /> Alta
                    </button>
                    {isEditMode ? (
                        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md animate-pulse">
                            <Save size={14} /> Guardar Cambios
                        </button>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[10px] uppercase hover:bg-white transition-all">
                            <Edit2 size={14} className="text-blue-600" /> Gestionar
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-2 flex flex-col">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 mb-2 rounded-lg text-xs font-bold flex justify-between items-center shadow-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={14} /></button>
                    </div>
                )}
                <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-auto h-full no-scrollbar relative">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-5">
                            <div className="w-14 h-14 border-[5px] border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-black text-black uppercase tracking-[0.3em] text-sm">Sincronizando...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse table-fixed min-w-[1900px]">
                            <thead className="sticky top-0 z-40">
                                <tr className="bg-slate-950">
                                    <th className="w-[120px] p-2 text-[10px] font-black text-slate-400 uppercase text-left sticky left-0 bg-slate-950 border-r-2 border-slate-800">Sede</th>
                                    <th className="w-[150px] p-2 text-[10px] font-black text-slate-400 uppercase text-left border-r-2 border-slate-800">Funcionario</th>
                                    <th className="w-[100px] p-2 text-[10px] font-black text-slate-400 uppercase text-center border-r-2 border-slate-800">Contacto</th>
                                    {DAYS.map(d => <th key={d} className="p-2 text-[10px] font-black text-slate-400 uppercase text-center border-r border-slate-800">{d}</th>)}
                                    {isEditMode && <th className="w-[60px] bg-red-950 border-l border-slate-800 text-[10px] text-white font-black text-center uppercase">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {filteredData.map((item, escIdx) => (
                                    <React.Fragment key={item.escenario}>
                                        {item.gestores.length > 0 ? (
                                            item.gestores.map((g, gIdx) => {
                                                const isEven = escIdx % 2 === 0;
                                                const bg = isEven ? 'bg-white' : 'bg-[#7AA0E1]';
                                                const border = isEven ? 'border-slate-300' : 'border-[#6c91cf]';

                                                return (
                                                    <tr key={`${item.escenario}-${g.nombre}`} className={`${bg} transition-all hover:bg-blue-200/50 group`}>
                                                        {gIdx === 0 && (
                                                            <td rowSpan={item.gestores.length} className={`p-2 sticky left-0 ${bg} z-30 border-r-4 ${isEven ? 'border-slate-400' : 'border-blue-700'} shadow-lg font-black text-[11px] uppercase text-black align-middle leading-tight`}>
                                                                {item.escenario}
                                                            </td>
                                                        )}
                                                        <td className={`p-2 border-r-2 ${border} font-black text-[11px] uppercase text-black`}>{g.nombre}</td>
                                                        <td className={`p-1.5 border-r-2 ${border} text-center`}>
                                                            {isEditMode ? (
                                                                <input type="text" className="w-full p-1 bg-white/40 border-2 border-black/10 rounded-lg text-[10px] font-black text-center text-black outline-none focus:bg-white" value={g.contacto} onChange={e => handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'contacto', e.target.value)} />
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Phone size={10} className="text-black/60" />
                                                                    <span className="text-[11px] font-black text-black">{g.contacto || '---'}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        {g.turnos.map((t, tIdx) => (
                                                            <td key={tIdx} className={`p-1 border-r ${border} align-middle`}>
                                                                {isEditMode ? (
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <select className="w-full p-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-center" value={TURNO_PRESETS.includes(t) ? t : "custom"} onChange={e => {
                                                                            if (e.target.value !== "custom") {
                                                                                handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'turnos', e.target.value, tIdx);
                                                                            }
                                                                        }}>
                                                                            <option value="custom">✍️</option>
                                                                            {TURNO_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                        </select>
                                                                        <input type="text" className="w-full p-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-center" value={t} onChange={e => handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'turnos', e.target.value, tIdx)} />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`mx-auto p-1.5 rounded-lg border text-[10px] font-bold text-center leading-none min-w-[100px] shadow-sm tracking-tighter uppercase ${getTurnoStyle(t)}`}>
                                                                        {t || '---'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                        {isEditMode && (
                                                            <td className="text-center p-1 bg-red-600/10">
                                                                <button onClick={() => handleDelete(item.escenario, g.nombre)} className="p-1 text-red-600 hover:scale-110 transition-all">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : item.gaps.length > 0 ? (
                                            <tr className={escIdx % 2 === 0 ? 'bg-white' : 'bg-[#7AA0E1]'}>
                                                <td className={`p-2 sticky left-0 bg-inherit z-30 border-r-4 ${escIdx % 2 === 0 ? 'border-slate-400' : 'border-blue-700'} shadow-lg font-black text-[11px] uppercase text-black/40`}>{item.escenario}</td>
                                                <td colSpan={DAYS.length + 3} className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-2 py-2">
                                                        <AlertCircle className="text-red-600/50" size={16} />
                                                        <span className="text-black/30 font-black uppercase text-[10px] tracking-[0.1em] italic">ESPACIO VACANTE</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}

                                        {item.gaps.length > 0 && (
                                            <tr className="bg-white border-t border-slate-200">
                                                <td className="p-2 sticky left-0 bg-white z-30 border-r-4 border-red-600 font-black text-[10px] text-red-600 uppercase italic leading-none">⚠️ Alerta Cobertura</td>
                                                <td className="p-2 font-bold text-[10px] text-slate-500 uppercase">Falta Cobertura:</td>
                                                <td className="border-r border-slate-100"></td>
                                                {DAYS.map((_, i) => {
                                                    const dayGaps = item.gaps.filter(g => g.day === i);
                                                    return (
                                                        <td key={i} className="p-2 border-r border-slate-200">
                                                            {dayGaps.length > 0 && (
                                                                <div className="flex flex-col gap-1">
                                                                    {dayGaps.map(g => (
                                                                        <button
                                                                            key={g.shift}
                                                                            onClick={() => {
                                                                                setActiveGap({ escenario: item.escenario, day: i, shift: g.shift });
                                                                                setShowReplacementModal(true);
                                                                            }}
                                                                            className="bg-red-600 text-white text-[9px] font-black py-1.5 px-2 rounded-lg text-center uppercase tracking-tighter hover:bg-black transition-all group/btn"
                                                                        >
                                                                            {g.shift}
                                                                            <span className="block text-[7px] opacity-0 group-hover/btn:opacity-100 transition-opacity">BUSCAR REEMPLAZO</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                {isEditMode && <td className="bg-red-600/5"></td>}
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-slate-200">
                        <div className="p-5 border-b-2 border-slate-100 flex justify-between items-center bg-slate-900">
                            <h2 className="text-white font-bold uppercase text-sm flex items-center gap-2 tracking-tight">
                                <Shield className="text-blue-400" size={18} />
                                Alta de Funcionario
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-all hover:bg-white/10 p-2 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 bg-slate-50">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm" value={newGestor.nombre} onChange={e => setNewGestor({ ...newGestor, nombre: e.target.value.toUpperCase() })} placeholder="NOMBRE REAL..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contacto</label>
                                    <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all shadow-sm" value={newGestor.contacto} onChange={e => setNewGestor({ ...newGestor, contacto: e.target.value })} placeholder="3XX..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sede Asignada</label>
                                    <select className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-500 transition-all text-slate-700 shadow-sm" value={newGestor.escenario} onChange={e => setNewGestor({ ...newGestor, escenario: e.target.value })}>
                                        <option value="" disabled>Seleccione...</option>
                                        {allowedEscenarios.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 mt-2">
                                <Plus size={16} /> Registrar Funcionario
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReplacementModal && activeGap && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-slate-200">
                        <div className="p-5 border-b-2 border-slate-100 flex justify-between items-center bg-slate-900">
                            <div className="text-white">
                                <h2 className="font-bold uppercase text-sm flex items-center gap-2 tracking-tight text-white leading-none">
                                    <Search size={18} className="text-blue-400" />
                                    Buscar Reemplazo
                                </h2>
                                <p className="text-[9px] font-medium uppercase tracking-wider opacity-60 mt-1 ledaning-none">
                                    {activeGap.escenario} • {DAYS[activeGap.day]} ({activeGap.shift})
                                </p>
                            </div>
                            <button onClick={() => setShowReplacementModal(false)} className="text-white/40 hover:text-white transition-all hover:bg-white/10 p-2 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 max-h-[50vh] overflow-auto no-scrollbar bg-slate-50">
                            <div className="space-y-2">
                                {(() => {
                                    // Lógica para encontrar gestores LIBRES en ese día y turno
                                    const allUniqueGestores = [];
                                    const map = new Map();
                                    data.forEach(esc => {
                                        esc.gestores.forEach(g => {
                                            if (!map.has(g.nombre)) {
                                                map.set(g.nombre, g);
                                                allUniqueGestores.push(g);
                                            }
                                        });
                                    });

                                    const targetShiftKey = activeGap.shift === 'MAÑANA' ? '6:00' : '2:30';

                                    const available = allUniqueGestores.filter(g => {
                                        let hasDifferentShiftOnSameDay = false;
                                        let isBlockingStatus = false;

                                        data.forEach(esc => {
                                            const match = esc.gestores.find(eg => eg.nombre === g.nombre);
                                            if (match) {
                                                const currentDayTurno = (match.turnos[activeGap.day] || '').toUpperCase();

                                                if (currentDayTurno !== "") {
                                                    // Estados bloqueantes
                                                    if (currentDayTurno.includes('DESCANSO') ||
                                                        currentDayTurno.includes('VACACIONES') ||
                                                        currentDayTurno.includes('INCAPACITADA')) {
                                                        isBlockingStatus = true;
                                                    }
                                                    // Ya tiene otro turno diferente (Regla: solo un turno por día)
                                                    else if (!currentDayTurno.includes(targetShiftKey)) {
                                                        hasDifferentShiftOnSameDay = true;
                                                    }
                                                }
                                            }
                                        });

                                        return !isBlockingStatus && !hasDifferentShiftOnSameDay;
                                    });

                                    if (available.length === 0) {
                                        return (
                                            <div className="text-center py-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                                                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2 opacity-50" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin disponibilidad</p>
                                            </div>
                                        );
                                    }

                                    return available.map(g => (
                                        <button
                                            key={g.nombre}
                                            onClick={() => handleAssignReplacement(g)}
                                            className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-xs uppercase">
                                                    {g.nombre.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-[13px] text-slate-900 uppercase leading-none">{g.nombre}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{g.contacto || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <Plus size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                                        </button>
                                    ));
                                })()}
                            </div>
                        </div>
                        <div className="p-3 bg-white text-center border-t border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-center gap-1.5 leading-none">
                                <Shield size={10} className="text-emerald-500" /> Personal apto para este bloque horario
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}