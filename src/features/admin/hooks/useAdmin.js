import { useState, useCallback, use } from "react";
import { AdminRepository } from "../api/admin.repository";
import { useAuth } from "../../../providers/AuthProvider";
import { toast } from "sonner";
import { set } from "date-fns";

export function useAdmin() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [config, setConfig] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getUsers(filters);
            setUsers(result.users);
            setPagination({ 
                page: result.page, 
                totalPages: result.totalPages, 
                total: result.total 
            });
        } catch (err) {
            toast.error("Error al cargando los usuarios ");
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserRole = async (userId, {roleId, dependencyId, isActive}) => {
        try {
            await AdminRepository.updateUser(userId, { role_id: roleId, 
            dependency_id: dependencyId, 
            is_active: isActive 
        }, user.id);

            toast.success("Usuario actualizado exitosamente");
            await fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const createUser = async (userData) => {
        try {
            await AdminRepository.createUser(userData, user.id);
            toast.success("Usuario creado exitosamente");
            await fetchUsers();
        } catch (err) {
            toast.error(err.message); 
        }
    };

    const fetchAuditLogs = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const result = await AdminRepository.getAuditLogs(filters);
            setAuditLogs(result.logs);
        } catch (err) {
            toast.error("Error cargando auditoria");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const data = await AdminRepository.getConfig();
            setConfig(data);
        } catch (err) {
            toast.error("Error cargando configuración");
        }
    }, []);

    const updateConfig = async (newConfig) => {
        try {
            await AdminRepository.updateConfig(newConfig, user.id);
            toast.success("Configuración actualizada");
            await fetchConfig();
        } catch (err) {
            toast.error("err.message");
        }
    };

    return {
        users,
        auditLogs,
        config,
        pagination,
        loading,
        fetchUsers,
        updateUserRole,
        createUser,
        fetchAuditLogs,
        fetchConfig,
        updateConfig
    };
}