import { notFound } from "next/navigation";
import { WORKFLOWS, type WorkflowId } from "@thoroughloop/core";
import { WorkflowRunner } from "@/components/WorkflowRunner";

export function generateStaticParams() {
  return WORKFLOWS.map((workflow) => ({ slug: workflow.id }));
}

export default async function WorkflowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workflow = WORKFLOWS.find((item) => item.id === slug);

  if (!workflow) {
    notFound();
  }

  return <WorkflowRunner workflowId={workflow.id as WorkflowId} />;
}
