import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

type CookieConfig = {
  maxAge: number | null;
};

function isLocalHost(host: string | null) {
  return /(localhost|127\.0\.0\.1):\d+/.test(host ?? "");
}

function isCorsRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  return (
    originUrl.host !== request.headers.get("host") ||
    originUrl.protocol !== requestUrl.protocol
  );
}

function getCookieNames(host: string | null) {
  const prefix = isLocalHost(host) ? "" : "__Host-";
  return {
    token: `${prefix}__convexAuthJWT`,
    refreshToken: `${prefix}__convexAuthRefreshToken`,
    verifier: `${prefix}__convexAuthOAuthVerifier`,
  };
}

function setCookie(
  response: NextResponse,
  name: string,
  value: string | null,
  cookieConfig: CookieConfig,
  host: string | null,
) {
  const secure = !isLocalHost(host);

  if (value === null) {
    response.cookies.set(name, "", {
      expires: 0,
      httpOnly: true,
      maxAge: undefined,
      path: "/",
      sameSite: "lax",
      secure,
    });
    return;
  }

  response.cookies.set(name, value, {
    httpOnly: true,
    maxAge: cookieConfig.maxAge ?? undefined,
    path: "/",
    sameSite: "lax",
    secure,
  });
}

function setAuthCookies(
  response: NextResponse,
  tokens: { token: string; refreshToken: string } | null,
  cookieConfig: CookieConfig,
  host: string | null,
) {
  const names = getCookieNames(host);

  setCookie(response, names.token, tokens?.token ?? null, cookieConfig, host);
  setCookie(
    response,
    names.refreshToken,
    tokens?.refreshToken ?? null,
    cookieConfig,
    host,
  );
  setCookie(response, names.verifier, null, cookieConfig, host);
}

function json(body: unknown, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function getConvexOptions() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    return { url: process.env.NEXT_PUBLIC_CONVEX_URL };
  }

  return {};
}

export async function POST(request: NextRequest) {
  const cookieConfig = { maxAge: null } satisfies CookieConfig;
  const host = request.headers.get("host");

  if (isCorsRequest(request)) {
    return new NextResponse("Invalid origin", { status: 403 });
  }

  const { action, args } = await request.json();

  if (action !== "auth:signIn" && action !== "auth:signOut") {
    return new NextResponse("Invalid action", { status: 400 });
  }

  let token: string | undefined;

  if (action === "auth:signIn" && args?.refreshToken !== undefined) {
    const refreshToken = request.cookies.get(
      getCookieNames(host).refreshToken,
    )?.value;

    if (!refreshToken) {
      return json({ tokens: null });
    }

    args.refreshToken = refreshToken;
  } else {
    token = request.cookies.get(getCookieNames(host).token)?.value;
  }

  if (action === "auth:signIn") {
    try {
      const result = await fetchAction(action, args, {
        ...getConvexOptions(),
        ...(args?.refreshToken !== undefined || args?.params?.code !== undefined
          ? {}
          : { token }),
      });

      if (
        typeof result === "object" &&
        result !== null &&
        "redirect" in result &&
        typeof result.redirect === "string"
      ) {
        const response = json({ redirect: result.redirect });
        if ("verifier" in result && typeof result.verifier === "string") {
          setCookie(
            response,
            getCookieNames(host).verifier,
            result.verifier,
            cookieConfig,
            host,
          );
        }
        return response;
      }

      if (
        typeof result === "object" &&
        result !== null &&
        "tokens" in result
      ) {
        const response = json({
          tokens:
            result.tokens !== null
              ? { token: result.tokens.token, refreshToken: "dummy" }
              : null,
        });

        setAuthCookies(response, result.tokens, cookieConfig, host);
        return response;
      }

      return json(result);
    } catch (error) {
      const response = json(
        {
          error: error instanceof Error ? error.message : "Authentication failed",
        },
        400,
      );
      setAuthCookies(response, null, cookieConfig, host);
      return response;
    }
  }

  try {
    await fetchAction(action, args, {
      ...getConvexOptions(),
      token,
    });
  } catch {}

  const response = json(null);
  setAuthCookies(response, null, cookieConfig, host);
  return response;
}
