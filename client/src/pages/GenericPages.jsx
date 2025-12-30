import React from 'react';
import { Link } from 'react-router-dom';

export default function GenericPage({ title, icon, description }) {
    return (
        <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-4">{title} {icon}</h1>
            <p className="text-lg text-gray-700 mb-6">{description}</p>

            <p className="border-t pt-4 mt-6">
                <Link to="/dashboard" className="text-blue-600 hover:underline">← Volver al inicio</Link>
            </p>
        </div>
    );
}

export function CulturaPage() {
    return <GenericPage title="Cultura" icon="🎭" description="Bienvenido al área de Cultura. Aquí encontrarás información sobre eventos culturales y artísticos." />;
}

export function FomentoPage() {
    return <GenericPage title="Fomento Deportivo" icon="🏆" description="Programas de apoyo al deporte y formación de nuevos talentos." />;
}

export function ActividadFisicaPage() {
    return <GenericPage title="Actividad Física" icon="🏃‍♀️" description="Promoción de hábitos saludables y actividad física para la comunidad." />;
}
