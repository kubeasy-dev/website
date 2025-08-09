import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  persistence: "localStorage+cookie",
  ui_host: "https://eu.i.posthog.com",
  capture_pageview: false,
  capture_pageleave: true,
  person_profiles: "always",
  debug: process.env.NODE_ENV === "development",
  disable_session_recording: process.env.NODE_ENV === "development",
});

export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse'
) {
  posthog.capture('$pageview', { $current_url: url, $navigation_type: navigationType });
}