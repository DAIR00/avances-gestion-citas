import { use, useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";

export function ProfessionalDashboard() {
  const { appointments, fetchAppointments, updateStatus, isLoading } = useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("pending"); //pending, confirmed, completed

  useEffect(() => {
    fetchAppointments({ status: filter });
  }, [filter, fetchAppointments]);

  const handleConfirm = (id) => updateStatus(id, "confirmed");
  const handleComplete = (id) => updateStatus(id, "completed", notes);
  const handleShow = (id) => updateStatus(id, "no_show");
  
  return (
    <div className="dashboard-container">
        <header className="dashboard-header">
            <h1>Citas - {profile?.dependencies?.name}</h1>
            <div className="filter-tabs">
                {["pending", "confirmed", "completed"].map((status) => (
                    <button
                        key={status}
                        className={filter === status ? "active" : ""}
                        onClick={() => setFilter(status)}
                    >
                        {status === "pending" && "Pendientes"}
                        {status === "confirmed" && "Confirmadas"}
                        {status === "completed" && "Historial"}
                    </button>
                ))}
            </div> 
        </header>
        <div className="appointments-grid">
            {isLoading ? (
                <p>Cargando citas...</p>
            ) : (
                appointments.map((apt) => (
                    <div key={apt.id} className="appointment-wrapper">
                        <AppointmentCard appointment={apt} isAprendiz={false} />
                        {filter === "pending" && (
                            <div className="appointment-actions">
                                <button onClick={() => handleConfirm(apt.id)} className="btn-success">Confirmar</button>
                                <button onClick={() => handleShow(apt.id)} className="btn-secondary">No Asistió</button>
                            </div>
                        )}

                        {filter === "confirmed" && (
                            <div className="professional-actions">
                                <button onClick={() => handleComplete(apt.id)} className="btn-primary">Completar Atención</button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
    );
}