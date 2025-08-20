export type GitHubSettings = {
  owner: string;
  repo: string;
  branch: string;
  token: string; // Fine-grained PAT recommended (contents:read/write)
};

export type GitHubFile = {
  path: string;
  sha?: string;
  content?: string; // decoded text
};

const STORAGE_KEY = 'gh-settings';

export function loadSettings(): GitHubSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSettings(s: GitHubSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function apiBase({owner, repo}: GitHubSettings) {
  return `https://api.github.com/repos/${owner}/${repo}`;
}

export async function getFile(settings: GitHubSettings, path: string, ref?: string): Promise<GitHubFile> {
  const url = `${apiBase(settings)}/contents/${encodeURIComponent(path)}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) {
    return {path};
  }
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${res.statusText}`);
  const json = await res.json();
  const decoded = json.content ? atob(json.content.replace(/\n/g, '')) : undefined;
  return {path, sha: json.sha, content: decoded};
}

export async function putFile(
  settings: GitHubSettings,
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<GitHubFile> {
  const url = `${apiBase(settings)}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: settings.branch,
    sha,
  } as any;
  if (!sha) delete body.sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path}: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return {path, sha: json.content?.sha};
}
