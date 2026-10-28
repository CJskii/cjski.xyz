import records from "../../content/lab-projects.json";
export const labProjects = records;
export type LabProject = (typeof records)[number];

export { default as serviceGroups } from "../../content/self-hosted-stack.json";
