import { ProjectsScreenContent } from "@/components/projects/ProjectsScreenContent";
import { AppShell } from "@/components/ui/AppShell";
import { getProjects } from "@/data/projects";

export default function Projects() {
  const projects = getProjects();

  return (
    <AppShell>
      <ProjectsScreenContent projects={projects} />
    </AppShell>
  );
}
