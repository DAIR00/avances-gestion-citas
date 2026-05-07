import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "#f59e0b", icon: AlertCircle },
  confirmed: { label: "Confirmada", color: "#3b82f6", icon: CheckCircle },
  completed: { label: "Completada", color: "#22c55e", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "#ef4444", icon: XCircle },
  no_show: { label: "No asistió", color: "#6b7280", icon: XCircle },
};

export function AppointmentCard({ appointment, onCancel, isAprendiz }) {
  const {
    dependencies,
    scheduled_date,
    scheduled_time,
    status,
    reason,
    profiles,
  } = appointment;
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className="appointment-card"
      style={{ borderLeft: `4px solid ${dependencies?.color || "#ccc"}` }}
    >
      <div className="card-header">
        <div
          className="dependency-badge"
          style={{ background: dependencies?.color }}
        >
          {dependencies?.name}
        </div>
        <div className="status-badge" style={{ color: config.color }}>
          <Icon size={16} />
          <span>{config.label}</span>
        </div>
      </div>

      <div className="card-datetime">
        <div className="datetime-item">
          <Calendar size={16} />
          <span>{format(parseISO(scheduled_date), "PPP", { locale: es })}</span>
        </div>
        <div className="datetime-item">
          <Clock size={16} />
          <span>{scheduled_time}</span>
        </div>
      </div>

      <div className="card-body">
        <p className="reason">{reason}</p>
        {!isAprendiz && profiles && (
          <div className="aprendiz-info">
            <User size={14} />
            <span>{profiles.full_name}</span>
          </div>
        )}
      </div>

      {isAprendiz && status === "pending" && (
        <div className="card-actions">
          <button onClick={onCancel} className="btn-danger">
            Cancelar Cita
          </button>
        </div>
      )}
    </div>
  );
}
