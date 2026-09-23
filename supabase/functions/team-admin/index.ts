import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...cors, "Content-Type": "application/json" }
});

const cleanPermissions = (p: any) => {
  const patients = p?.patients !== false;
  return {
    patients,
    agenda: patients && p?.agenda !== false,
    assessments: patients && p?.assessments !== false,
    evolutions: patients && p?.evolutions !== false,
    documents: patients && p?.documents !== false,
    caa: patients && p?.caa !== false,
    finance: patients && !!p?.finance,
    reports: patients && !!p?.reports,
    manage_team: false
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método inválido." }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Não autenticado." }, 401);

  const userResult = await admin.auth.getUser(token);
  const caller = userResult.data.user;
  if (userResult.error || !caller) return json({ error: "Sessão inválida." }, 401);

  const memberResult = await admin.from("clinic_members")
    .select("id,owner_id,permissions,status")
    .eq("user_id", caller.id).eq("status", "active")
    .order("created_at", { ascending: true }).limit(1);

  const ownMembership = memberResult.data?.[0] || null;
  const ownerId = ownMembership ? ownMembership.owner_id : caller.id;
  if (ownMembership) return json({ error: "Somente a conta proprietária pode gerenciar a equipe." }, 403);

  const accessResult = await admin.from("account_access")
    .select("team_member_limit,plan_tier,status")
    .eq("user_id", ownerId).maybeSingle();
  const teamLimit = Number(accessResult.data?.team_member_limit || 0);

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");

  if (action === "invite") {
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "Profissional").trim() || "Profissional";
    const permissions = cleanPermissions(body?.permissions);

    if (!name) return json({ error: "Informe o nome do profissional." }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Informe um e-mail válido." }, 400);
    if (email === String(caller.email || "").toLowerCase()) return json({ error: "Esse e-mail já é o acesso principal da clínica." }, 400);

    const existingMembership = await admin.from("clinic_members")
      .select("id,user_id,status").eq("owner_id", ownerId).eq("email", email).maybeSingle();

    if (existingMembership.data?.status === "active") {
      return json({ error: "Esse profissional já faz parte da equipe." }, 409);
    }

    const activeCountResult = await admin.from("clinic_members")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId).eq("status", "active");
    const activeCount = Number(activeCountResult.count || 0);

    if (teamLimit <= 0) {
      return json({ error: "Seu plano atual não possui vagas de equipe.", code: "TEAM_NOT_INCLUDED", limit: teamLimit, used: activeCount }, 403);
    }
    if (activeCount >= teamLimit) {
      return json({ error: "Você atingiu o limite de profissionais do seu plano.", code: "TEAM_LIMIT_REACHED", limit: teamLimit, used: activeCount }, 403);
    }

    let targetUser: any = null;
    let invitationSent = false;

    if (existingMembership.data?.user_id) {
      const byId = await admin.auth.admin.getUserById(existingMembership.data.user_id);
      targetUser = byId.data.user || null;
    }

    if (!targetUser) {
      const invite = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: "https://casalinhofisio.github.io/FONELY/?team_invite=1",
        data: { name, full_name: name, fonely_team_owner_id: ownerId, fonely_team_role: role }
      });

      if (!invite.error && invite.data.user) {
        targetUser = invite.data.user;
        invitationSent = true;
      } else {
        for (let page = 1; page <= 20 && !targetUser; page++) {
          const users = await admin.auth.admin.listUsers({ page, perPage: 100 });
          if (users.error) break;
          targetUser = users.data.users.find((u: any) => String(u.email || "").toLowerCase() === email) || null;
          if ((users.data.users || []).length < 100) break;
        }
        if (!targetUser) return json({ error: invite.error?.message || "Não foi possível criar o convite." }, 400);
      }
    }

    const row = {
      owner_id: ownerId,
      user_id: targetUser.id,
      email,
      name,
      role,
      permissions,
      status: "active",
      invited_by: caller.id,
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const saved = existingMembership.data?.id
      ? await admin.from("clinic_members").update(row).eq("id", existingMembership.data.id).eq("owner_id", ownerId).select().single()
      : await admin.from("clinic_members").insert(row).select().single();

    if (saved.error) return json({ error: saved.error.message }, 400);

    return json({
      ok: true,
      member: saved.data,
      invitation_sent: invitationSent,
      existing_login: !invitationSent,
      team_limit: teamLimit,
      team_used: activeCount + 1
    });
  }

  if (action === "update") {
    const memberId = String(body?.member_id || "");
    if (!memberId) return json({ error: "Profissional não informado." }, 400);

    const patch = {
      name: String(body?.name || "").trim(),
      role: String(body?.role || "Profissional").trim() || "Profissional",
      permissions: cleanPermissions(body?.permissions),
      updated_at: new Date().toISOString()
    };

    const updated = await admin.from("clinic_members").update(patch)
      .eq("id", memberId).eq("owner_id", ownerId).eq("status", "active")
      .select().maybeSingle();

    if (updated.error) return json({ error: updated.error.message }, 400);
    if (!updated.data) return json({ error: "Profissional não encontrado." }, 404);
    return json({ ok: true, member: updated.data, team_limit: teamLimit });
  }

  if (action === "remove") {
    const memberId = String(body?.member_id || "");
    if (!memberId) return json({ error: "Profissional não informado." }, 400);

    const removed = await admin.from("clinic_members").update({
      status: "removed",
      updated_at: new Date().toISOString()
    }).eq("id", memberId).eq("owner_id", ownerId).eq("status", "active").select("id").maybeSingle();

    if (removed.error) return json({ error: removed.error.message }, 400);
    if (!removed.data) return json({ error: "Profissional não encontrado." }, 404);
    return json({ ok: true, team_limit: teamLimit });
  }

  return json({ error: "Ação inválida." }, 400);
});