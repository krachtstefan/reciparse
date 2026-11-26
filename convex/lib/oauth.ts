import { createRemoteJWKSet, jwtVerify } from "jose";

type OAuthConfig = Readonly<{ issuer: string; resource: string }>;

function httpsUrl(value: string | undefined) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

export function oauthConfig(): OAuthConfig | null {
  const issuer = httpsUrl(process.env.AUTHKIT_DOMAIN);
  const resource = httpsUrl(process.env.MCP_RESOURCE_URL);
  if (
    !issuer ||
    issuer.pathname !== "/" ||
    issuer.search ||
    issuer.hash ||
    !resource ||
    resource.pathname !== "/mcp" ||
    resource.search ||
    resource.hash
  ) {
    return null;
  }
  return { issuer: issuer.origin, resource: resource.href };
}

export function resourceMetadata(config: OAuthConfig) {
  return {
    resource: config.resource,
    authorization_servers: [config.issuer],
    bearer_methods_supported: ["header"],
    resource_name: "Reciparse",
  };
}

export function bearerChallenge(config: OAuthConfig | null, rejected: boolean) {
  const parts = ['Bearer realm="Reciparse"'];
  if (rejected) {
    parts.push('error="invalid_token"');
  }
  if (config) {
    const origin = new URL(config.resource).origin;
    parts.push(
      `resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`
    );
  }
  return parts.join(", ");
}

let cachedKeys:
  | { issuer: string; keys: ReturnType<typeof createRemoteJWKSet> }
  | undefined;
const accountPattern = /^user_[A-Za-z0-9]+$/;

export async function verifyAccessToken(config: OAuthConfig, token: string) {
  try {
    if (cachedKeys?.issuer !== config.issuer) {
      cachedKeys = {
        issuer: config.issuer,
        keys: createRemoteJWKSet(new URL("/oauth2/jwks", config.issuer)),
      };
    }
    const { payload } = await jwtVerify(token, cachedKeys.keys, {
      issuer: config.issuer,
      audience: config.resource,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "sub"],
    });
    if (
      payload.sub_profile === "ai_agent" ||
      !payload.sub ||
      !accountPattern.test(payload.sub)
    ) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}
