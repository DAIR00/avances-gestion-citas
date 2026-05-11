import { supabase } from "../../../lib/supabase";

export class AdminRepository {
    
    static async getUsers ({ role, status, search, page = 1, limit = 20 }) {
        let query = supabase
        .from("users")
        .select(`
            *,
            roles (name, description),
            dependencies (name)
        `, { count: 'exact' })
    if (role) query = query.eq('roles.name', role);
    if (status !== undefined) query = query.eq('is_active', status);
    if (search) {
        query = query.or(`full_name.ilike.%${search}%, document_number.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error (`Error fetching users: ${error.message}`);
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
        .update({...updates, updated_at: new Date()})
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
            newData
        })
        return newData;
    }
    static async createUser({ email, password, fullName, roleId, dependencyId }, adminId) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });
    } 
}