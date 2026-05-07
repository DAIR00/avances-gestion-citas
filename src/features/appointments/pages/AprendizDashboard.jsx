import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import { AppointmentCard } from "../components/AppointmentCard";
import { Plus } from "lucide-react";

export default function AprendizDashboard() {
  const { appointments, fetchAppointments, cancelAppointment, isLoading } =
    useAppointments();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Mis Citas de Bienestar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={20} />
          Nueva Cita
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Solicitar Nueva Cita</h2>
            <AppointmentForm
              onSuccess={() => {
                setShowForm(false);
                fetchAppointments();
              }}
            />
          </div>
        </div>
      )}

      <section className="appointments-list">
        {isLoading ? (
          <p>Cargando tus citas...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No tienes citas agendadas</p>
            <button onClick={() => setShowForm(true)} className="btn-link">
              Agenda tu primera cita aquí
            </button>
          </div>
        ) : (
          appointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              isAprendiz={true}
              onCancel={() => cancelAppointment(apt.id)}
            />
          ))
        )}
      </section>
    </div>
  );
}
