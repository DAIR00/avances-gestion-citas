import { supabase } from "../../../lib/supabase";

export class AdminRepository {
    static async getUsers({ role, status, search, page = 1, limit = 20 }) {
        let query = supabase
            .from("users")
            .select(
                `
            *,
            roles (name, description),
            dependencies (name)
        `,
                { count: "exact" }
            );

        if (role) query = query.eq("roles.name", role);
        if (status !== undefined) query = query.eq("is_active", status);
        if (search) {
            query = query.or(
                `full_name.ilike.%${search}%, document_number.ilike.%${search}%`
            );
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query.range(from, to);
        if (error) throw new Error(`Error fetching users: ${error.message}`);
        return { users: data, total: count, page, totalPages: Math.ceil(count / limit) };
    }

    static async updateUser(userId, updates, adminId) {
        const { data: oldData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        const { data: newData, error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date() })
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_USER",
            entitytype: "user",
            entityId: userId,
            oldData,
            newData,
        });

        return newData;
    }

    static async createUser({ email, password, fullName, roleId, dependencyId }, adminId) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .update({ role_id: roleId, dependency_id: dependencyId })
            .eq("id", authData.user.id)
            .select()
            .single();

        if (profileError) throw profileError;

        await this.logAction({
            userId: adminId,
            action: "CREATE_USER",
            entitytype: "user",
            entityId: authData.user.id,
            newData: profile,
        });

        return profile;
    }

    static async getAuditLogs({ action, userId, dateFrom, dateTo, page = 1, limit = 50 }) {
        let query = supabase
            .from("audit_logs")
            .select(
                `
            *,
            admin:profiles!user_id (full_name,email)
        `,
                { count: "exact" }
            );

        if (action) query = query.eq("action", action);
        if (userId) query = query.eq("user_id", userId);
        if (dateFrom) query = query.gte("created_at", dateFrom);
        if (dateTo) query = query.lte("created_at", dateTo);

        const from = (page - 1) * limit;
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, from + limit - 1);

        if (error) throw error;
        return { logs: data, total: count };
    }

    static async getConfig() {
        const { data, error } = await supabase
            .from("system_config")
            .select("*")

        if (error) throw error;
        return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    }
    static async updateConfig(updates, adminId) {
        const { data: oldConfig } = await supabase
            .from("system_config")
            .select("*")
            .eq("key", key)
            .single();

        const { data, error} = await supabase
            .from("system_config")
            .update({
                valur,
                update_by: adminId,
                updated_at: new Date(),
            })
            .eq("key", key)
            .select()
            .single();
        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: "UPDATE_CONFIG",
            entitytype: "config",
            entityId: key,
            oldData: oldConfig,
            newData: data,
        });

        return data;
    }

    static async logAction({ userId, action, entitytype, entityId, oldData, newData }) {
        const ip = null;
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

        await supabase.from("audit_logs").insert({
            user_id: userId,
            action,
            entity_type: entitytype,
            entityId: entityId,
            oldData: oldData,
            newData: newData,
            user_agent: userAgent
        })
    }
}
