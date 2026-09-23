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
    accepted_at: member.accepted_at || now, last_active_at: now, updated_at: now
  }).eq("id", member.id).then(() => {});

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "load");
  const permissions = {
    finance: !!member.permissions?.finance,
    reports: !!member.permissions?.reports,
    manage_team: false
  };

  const ws = await admin.from("workspace_state").select("data,updated_at")
    .eq("user_id", member.owner_id).maybeSingle();
  if (ws.error) return json({ error: ws.error.message }, 400);

  const current = (ws.data?.data && typeof ws.data.data === "object") ? ws.data.data : {};

  if (action === "load") {
    const safe: any = structuredClone(current);
    if (!permissions.finance) {
      safe.payments = [];
      safe.packages = stripPackageMoney(safe.packages);
    }
    if (!permissions.reports) safe.reports = [];
    safe.team = [];
    return json({
      ok: true, owner_id: member.owner_id,
      member: { id: member.id, name: member.name, role: member.role, permissions },
      data: safe, updated_at: ws.data?.updated_at || null
    });
  }

  if (action === "save") {
    const incoming = (body?.data && typeof body.data === "object") ? body.data : {};
    const merged: any = { ...current };
    ["patients","appointments","assessments","evolutions","assessmentTemplates"].forEach(key => {
      if (Array.isArray(incoming[key])) merged[key] = incoming[key];
    });
    if (permissions.reports && Array.isArray(incoming.reports)) merged.reports = incoming.reports;
    if (permissions.finance) {
      if (Array.isArray(incoming.payments)) merged.payments = incoming.payments;
      if (Array.isArray(incoming.packages)) merged.packages = incoming.packages;
    }

    const save = await admin.from("workspace_state").upsert({
      user_id: member.owner_id, data: merged, updated_at: now
    }, { onConflict: "user_id" });
    if (save.error) return json({ error: save.error.message }, 400);
    return json({ ok: true, updated_at: now });
  }

  return json({ error: "Ação inválida." }, 400);
});