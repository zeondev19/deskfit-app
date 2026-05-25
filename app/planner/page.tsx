import type { Metadata } from "next";
import PlannerWorkspace from "@/components/planner/PlannerWorkspace";

export const metadata: Metadata = {
  title: "Planner - DeskFit",
  description: "Create and validate a 2D top-view desk setup."
};

export default function PlannerPage() {
  return <PlannerWorkspace />;
}
