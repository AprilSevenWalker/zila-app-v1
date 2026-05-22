import { ProjectOperationalDetail } from "@/components/projects/ProjectOperationalDetail";
import { getDefaultProject, getProjectById, getProjects } from "@/data/projects";

export function generateStaticParams() {
  return getProjects().map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id) ?? getDefaultProject();

  return <ProjectOperationalDetail project={project} />;
}
