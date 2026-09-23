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

const normalizedPermissions = (p: any) => {
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

const stripPackageMoney = (packages: any[]) => (Array.isArray(packages) ? packages : []).map((item: any) => {
  const copy = { ...(item || {}) };
  ["value","price","amount","total","paid","sessionValue","paymentValue"].forEach(k => delete copy[k]);
  return copy;
});

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
  const user = userResult.data.user;
  if (userResult.error || !user) return json({ error: "Sessão inválida." }, 401);

  const memberResult = await admin.from("clinic_members")
    .select("id,owner_id,name,role,permissions,status,accepted_at")
    .eq("user_id", user.id).eq("status", "active")
    .order("created_at", { ascending: true }).limit(1);

  const member = memberResult.data?.[0];
  if (!member) return json({ error: "Este login não está vinculado a uma equipe ativa." }, 403);

  const now = new Date().toISOString();
  admin.from("clinic_members").update({
    accepted_at: member.accepted_at || now,
    last_active_at: now,
    updated_at: now
  }).eq("id", member.id).then(() => {});

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "load");
  const permissions = normalizedPermissions(member.permissions);

  const ws = await admin.from("workspace_state").select("data,updated_at")
    .eq("user_id", member.owner_id).maybeSingle();

  if (ws.error) return json({ error: ws.error.message }, 400);
  const current = (ws.data?.data && typeof ws.data.data === "object") ? ws.data.data : {};

  if (action === "load") {
    const safe: any = structuredClone(current);

    if (!permissions.patients) {
      safe.patients = [];
      safe.appointments = [];
      safe.assessments = [];
      safe.evolutions = [];
      safe.assessmentTemplates = [];
      safe.packages = [];
      safe.payments = [];
      safe.reports = [];
    } else {
      if (!permissions.agenda) safe.appointments = [];
      if (!permissions.assessments) {
        safe.assessments = [];
        safe.assessmentTemplates = [];
      }
      if (!permissions.evolutions) safe.evolutions = [];
      if (!permissions.documents && Array.isArray(safe.patients)) {
        safe.patients = safe.patients.map((p: any) => ({ ...p, documents: [] }));
      }
      if (!permissions.finance) {
        safe.payments = [];
        safe.packages = stripPackageMoney(safe.packages);
      }
      if (!permissions.reports) safe.reports = [];
    }

    safe.team = [];

    return json({
      ok: true,
      owner_id: member.owner_id,
      member: { id: member.id, name: member.name, role: member.role, permissions },
      data: safe,
      updated_at: ws.data?.updated_at || null
    });
  }

  if (action === "save") {
    const incoming = (body?.data && typeof body.data === "object") ? body.data : {};
    const merged: any = structuredClone(current);

    if (permissions.patients && Array.isArray(incoming.patients)) {
      if (permissions.documents) {
        merged.patients = incoming.patients;
      } else {
        const oldPatients = Array.isArray(current.patients) ? current.patients : [];
        merged.patients = incoming.patients.map((p: any) => {
          const old = oldPatients.find((x: any) => x?.id === p?.id);
          return { ...(p || {}), documents: old?.documents || [] };
        });
      }
    }

    if (permissions.patients && permissions.agenda && Array.isArray(incoming.appointments)) {
      merged.appointments = incoming.appointments;
    }

    if (permissions.patients && permissions.assessments) {
      if (Array.isArray(incoming.assessments)) merged.assessments = incoming.assessments;
      if (Array.isArray(incoming.assessmentTemplates)) merged.assessmentTemplates = incoming.assessmentTemplates;
    }

    if (permissions.patients && permissions.evolutions && Array.isArray(incoming.evolutions)) {
      merged.evolutions = incoming.evolutions;
    }

    if (permissions.patients && permissions.reports && Array.isArray(incoming.reports)) {
      merged.reports = incoming.reports;
    }

    if (permissions.patients && permissions.finance) {
      if (Array.isArray(incoming.payments)) merged.payments = incoming.payments;
      if (Array.isArray(incoming.packages)) merged.packages = incoming.packages;
    }

    const saved = await admin.from("workspace_state").upsert({
      user_id: member.owner_id,
      data: merged,
      updated_at: now
    }, { onConflict: "user_id" });

    if (saved.error) return json({ error: saved.error.message }, 400);
    return json({ ok: true, updated_at: now });
  }

  return json({ error: "Ação inválida." }, 400);
});