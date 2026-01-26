// GitHub integration using Replit Connectors
import { Octokit } from '@octokit/rest'

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export async function createRepository(repoName: string, isPrivate: boolean = false) {
  const octokit = await getUncachableGitHubClient();
  
  const { data: user } = await octokit.users.getAuthenticated();
  
  try {
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate,
      description: 'KIRA - Privacy-first net worth tracker',
      auto_init: false,
    });
    
    return {
      success: true,
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      owner: user.login,
      name: repo.name,
    };
  } catch (error: any) {
    if (error.status === 422) {
      return {
        success: false,
        error: 'Repository already exists',
      };
    }
    throw error;
  }
}

export async function pushToRepository(owner: string, repo: string) {
  const octokit = await getUncachableGitHubClient();
  
  // Get current user for commits
  const { data: user } = await octokit.users.getAuthenticated();
  
  return {
    owner,
    repo,
    user: user.login,
    email: user.email || `${user.login}@users.noreply.github.com`,
  };
}
