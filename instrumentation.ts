import type { Instrumentation } from "next";
import { getPostHogClient } from "@/lib/analytics-server";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.captureException(error, undefined, {
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routerKind: context.routerKind,
    });
    await client.flush();
  } catch {
    // Silently fail - error tracking should never break the app
  }
};
