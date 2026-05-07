import { useState, useCallback } from "react";
import { DashboardRepository } from "../dashboard.repository";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useDashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [byDependency, setByDependency] = useState([]);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(false);

    const dateRange = {
        from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    };

    const fetchAllMetrics = useCallback(async (customRange = null) => {
        setLoading(true);
        const range = customRange || dateRange;

        try {
            const [kpiData, depData, monthlyData, profData] = await Promise.all([
                DashboardRepository.getKPIs(range),
                DashboardRepository.getAppointmentsByDependency(range),
                DashboardRepository.getMonthlyTrend(new Date().getFullYear()),
                DashboardRepository.getProfessionalPerformance(range),
            ]);

            setKpis(kpiData[0]);
            setByDependency(depData);
            setMonthlyTrend(monthlyData);
            setProfessionals(profData);
        } catch (error) {
            toast.error("Error cargando métricas");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportToCSV = async (range) => {
        try {
            const data = await DashboardRepository.getRawDataForExport(range || dateRange);

            const flatData = data.map((row) => ({
                ID: row.id,
                Fecha_Cita: row.scheduled_date,
                Hora: row.scheduled_time,
                Dependencia: row.dependencies?.name,
                Aprendiz: row.aprendiz?.full_name,
                Documento: row.aprendiz?.document_number,
                Profesional: row.professional?.full_name || "Sin asignar",
                Estado: row.status,
                Motivo: row.reason,
                Notas: row.notes,
                Fecha_Creacion: row.created_at,
            }));

            const headers = Object.keys(flatData[0] || {});
            const csv = [
                headers.join(","),
                ...flatData.map((row) =>
                    headers.map((h) => `"${row[h] || ""}"`).join(",")
                ),
            ].join("\n");

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `reporte_bienestar_${format(new Date(), "yyyy-MM-dd")}.csv`;
            link.click();

            toast.success("Reporte descargado");
        } catch (err) {
            toast.error("Error exportando datos");
            console.error(err);
        }
    };

    return {
        kpis,
        byDependency,
        monthlyTrend,
        professionals,
        loading,
        fetchAllMetrics,
        exportToCSV,
    };
};