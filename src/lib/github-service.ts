import fallback from "../../content/github-snapshot.json";
import { createGithubService, type GithubSnapshot } from "./github";
export const getGithubSnapshot = createGithubService({
  fallback: fallback as GithubSnapshot,
});
