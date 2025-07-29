import { NextRequest, NextResponse } from "next/server";
import { App } from "octokit";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challengeTitle = searchParams.get("challenge");

  if (!challengeTitle) {
    return NextResponse.json({ error: "Challenge title is required" }, { status: 400 });
  }

  try {
    // GitHub App authentication
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      console.error("GitHub App credentials not configured");
      return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 });
    }

    // Create GitHub App instance
    const app = new App({
      appId,
      privateKey,
    });

    // Get installation ID for the kubeasy-dev organization
    const { data: installations } = await app.octokit.rest.apps.listInstallations();
    const installation = installations.find((inst) => inst.account?.login === "kubeasy-dev");

    if (!installation) {
      console.error("GitHub App not installed on kubeasy-dev organization");
      return NextResponse.json({ error: "GitHub App not installed" }, { status: 500 });
    }

    // Get the Octokit instance for the installation
    const octokit = await app.getInstallationOctokit(installation.id);

    // Search for discussions in the challenges repository using GraphQL API
    // Expected title format: "💬 [Challenge Name] - Challenge Discussion for challenge \"[Challenge Name]\""
    const expectedTitle = `💬 ${challengeTitle} - Challenge Discussion for challenge "${challengeTitle}"`;

    // Use GraphQL to query discussions since REST API might not have discussions endpoint
    const query = `
      query($owner: String!, $repo: String!, $first: Int!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: $first) {
            nodes {
              title
              url
            }
          }
        }
      }
    `;

    const { repository } = await octokit.graphql<{
      repository: {
        discussions: {
          nodes: Array<{
            title: string;
            url: string;
          }>;
        };
      };
    }>(query, {
      owner: "kubeasy-dev",
      repo: "challenges",
      first: 100,
    });

    // Find the matching discussion
    const matchingDiscussion = repository.discussions.nodes.find((discussion: { title: string; url: string }) => discussion.title === expectedTitle);

    if (!matchingDiscussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }

    return NextResponse.json({
      url: matchingDiscussion.url,
      title: matchingDiscussion.title,
    });
  } catch (error) {
    console.error("Error fetching GitHub discussion:", error);
    return NextResponse.json({ error: "Failed to fetch discussion" }, { status: 500 });
  }
}
