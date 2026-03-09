import { Octokit } from "@octokit/rest";
import { GistConfig } from "./types.js";

export async function updateGist(
  config: GistConfig,
  title: string,
  content: string
): Promise<void> {
  const octokit = new Octokit({ auth: config.token });

  // Fetch the existing gist to get the current filename
  const { data: gist } = await octokit.gists.get({ gist_id: config.gistId });

  const files = gist.files;
  if (!files) {
    throw new Error("Gist has no files");
  }

  // Get the first file's name so we can rename it
  const existingFilename = Object.keys(files)[0]!;

  await octokit.gists.update({
    gist_id: config.gistId,
    description: title,
    files: {
      // Delete old file if name is changing
      ...(existingFilename !== title
        ? { [existingFilename]: null as any }
        : {}),
      [title]: { content },
    },
  });

  console.log(`✅ Gist updated: https://gist.github.com/${config.gistId}`);
}
