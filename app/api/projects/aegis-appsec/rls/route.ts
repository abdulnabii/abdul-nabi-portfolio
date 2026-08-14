import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface RlsTestResult {
  table: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
  userContext: "anon" | "authenticated" | "tenant_owner" | "cross_tenant_attacker" | "service_role";
  allowed: boolean;
  statusText: string;
  matchedPolicy: string;
  sqlPolicySnippet: string;
  securityVerdict: "SECURE" | "DATA_LEAK_RISK" | "BYPASS_RISK";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table = "health_records", operation = "SELECT", userContext = "authenticated", tenantId = "tenant_a" } = body;

    let allowed = false;
    let statusText = "Access Denied by RLS";
    let matchedPolicy = "Deny all by default";
    let sqlPolicySnippet = "-- No matching policy";
    let securityVerdict: "SECURE" | "DATA_LEAK_RISK" | "BYPASS_RISK" = "SECURE";

    if (userContext === "service_role") {
      allowed = true;
      statusText = "Bypassed via Supabase Service Role Key (Backend Only)";
      matchedPolicy = "Service Role Master Bypass";
      sqlPolicySnippet = "-- Service role bypasses RLS natively";
      securityVerdict = "SECURE";
    } else if (table === "health_records") {
      if (userContext === "anon") {
        allowed = false;
        statusText = "Access Denied: Anonymous users cannot query clinical health records.";
        matchedPolicy = "create policy \"Patients read own data only\" on health_records";
        sqlPolicySnippet = `create policy "Patients read own data only" 
on health_records for select 
to authenticated 
using (patient_id = auth.uid());`;
        securityVerdict = "SECURE";
      } else if (userContext === "tenant_owner" || userContext === "authenticated") {
        allowed = true;
        statusText = "Access Granted: User auth.uid() matches record patient_id.";
        matchedPolicy = "create policy \"Patients read own data only\" on health_records";
        sqlPolicySnippet = `create policy "Patients read own data only" 
on health_records for select 
to authenticated 
using (patient_id = auth.uid());`;
        securityVerdict = "SECURE";
      } else if (userContext === "cross_tenant_attacker") {
        allowed = false;
        statusText = "Access Blocked: Cross-tenant attacker auth.uid() ('user_attacker_99') does not match patient_id ('user_patient_01').";
        matchedPolicy = "create policy \"Patients read own data only\" on health_records";
        sqlPolicySnippet = `create policy "Patients read own data only" 
on health_records for select 
to authenticated 
using (patient_id = auth.uid());`;
        securityVerdict = "SECURE";
      }
    } else if (table === "billing_invoices") {
      if (userContext === "anon") {
        allowed = false;
        statusText = "Access Denied: Invoices require valid tenant session.";
        matchedPolicy = "create policy \"Tenant isolation for invoices\" on billing_invoices";
        sqlPolicySnippet = `create policy "Tenant isolation for invoices" 
on billing_invoices for all 
to authenticated 
using (tenant_id = (auth.jwt() ->> 'tenant_id'));`;
        securityVerdict = "SECURE";
      } else if (userContext === "cross_tenant_attacker") {
        allowed = false;
        statusText = "Access Blocked: JWT tenant claim ('tenant_beta') does not match requested row tenant_id ('tenant_alpha').";
        matchedPolicy = "create policy \"Tenant isolation for invoices\" on billing_invoices";
        sqlPolicySnippet = `create policy "Tenant isolation for invoices" 
on billing_invoices for all 
to authenticated 
using (tenant_id = (auth.jwt() ->> 'tenant_id'));`;
        securityVerdict = "SECURE";
      } else {
        allowed = true;
        statusText = "Access Granted: Valid tenant membership confirmed.";
        matchedPolicy = "create policy \"Tenant isolation for invoices\" on billing_invoices";
        sqlPolicySnippet = `create policy "Tenant isolation for invoices" 
on billing_invoices for all 
to authenticated 
using (tenant_id = (auth.jwt() ->> 'tenant_id'));`;
        securityVerdict = "SECURE";
      }
    }

    const result: RlsTestResult = {
      table,
      operation,
      userContext,
      allowed,
      statusText,
      matchedPolicy,
      sqlPolicySnippet,
      securityVerdict,
    };

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("[aegis-appsec/rls error]", err);
    return NextResponse.json({ error: err.message || "RLS simulation failed" }, { status: 500 });
  }
}
