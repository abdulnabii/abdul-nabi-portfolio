import { AdminShell } from "@/components/admin/admin-shell";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { getAdminSession } from "@/lib/auth";
import { getExperienceData, getEducationData } from "@/lib/settings-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const experience = await getExperienceData();
  const education = await getEducationData();

  return (
    <AdminShell email={session.email}>
      <ExperienceManager initialExperience={experience} initialEducation={education} />
    </AdminShell>
  );
}
