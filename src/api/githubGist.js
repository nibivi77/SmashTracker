import { GIST_FILENAME } from "../data/gistSyncSchema";

const API_BASE = "https://api.github.com";
const API_VERSION = "2022-11-28";

export class GistApiError extends Error {
  constructor(message, { status = null, code = "other" } = {}) {
    super(message);
    this.name = "GistApiError";
    this.status = status;
    this.code = code;
  }
}

function buildHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  return headers;
}

async function classifyAndThrow(response) {
  if (response.status === 404) {
    throw new GistApiError("Gist not found.", { status: 404, code: "not_found" });
  }

  if (response.status === 401) {
    throw new GistApiError("GitHub token is invalid or expired.", {
      status: 401,
      code: "unauthorized"
    });
  }

  if (response.status === 403) {
    if (response.headers.get("X-RateLimit-Remaining") === "0") {
      throw new GistApiError("GitHub API rate limit exceeded.", {
        status: 403,
        code: "rate_limited"
      });
    }

    throw new GistApiError(
      "GitHub token does not have permission (needs the 'gist' scope).",
      { status: 403, code: "unauthorized" }
    );
  }

  throw new GistApiError(`GitHub API error (${response.status}).`, {
    status: response.status,
    code: "other"
  });
}

async function request(url, options) {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new GistApiError("Network request failed (offline?).", { code: "network" });
  }

  if (!response.ok) {
    await classifyAndThrow(response);
  }

  return response.json();
}

export async function fetchGistFile({ gistId, token, filename = GIST_FILENAME }) {
  const gist = await request(`${API_BASE}/gists/${gistId}`, {
    headers: buildHeaders(token)
  });

  const file = gist.files?.[filename];

  if (!file) {
    return { exists: false, content: null };
  }

  try {
    return { exists: true, content: JSON.parse(file.content) };
  } catch {
    throw new GistApiError("Gist file is not valid JSON.", { code: "invalid_json" });
  }
}

export async function updateGistFile({
  gistId,
  token,
  filename = GIST_FILENAME,
  content
}) {
  if (!token) {
    throw new Error("A GitHub token is required to update a gist.");
  }

  return request(`${API_BASE}/gists/${gistId}`, {
    method: "PATCH",
    headers: { ...buildHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      files: { [filename]: { content: JSON.stringify(content, null, 2) } }
    })
  });
}

export function describeGistError(error) {
  const code = error?.code;

  if (code === "not_found") {
    return "Gist not found — check the Gist ID.";
  }

  if (code === "unauthorized") {
    return "GitHub token is invalid, expired, or missing the 'gist' scope.";
  }

  if (code === "rate_limited") {
    return "GitHub rate limit hit — try again in a bit.";
  }

  if (code === "network") {
    return "Offline — showing last-known local data.";
  }

  if (code === "invalid_json") {
    return "Gist data is corrupted or not valid JSON.";
  }

  return error?.message || "GitHub sync failed.";
}
