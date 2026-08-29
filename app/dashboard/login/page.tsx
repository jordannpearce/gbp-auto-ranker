import { redirect } from "next/navigation";

export default async function LegacyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  redirect(`/login${params.toString() ? `?${params}` : ""}`);
}
