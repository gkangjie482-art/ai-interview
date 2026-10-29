import type { MetadataRoute } from "next";
import { getInterviewList } from "@/features/interviews/server/loaders/get-interview";
import { routes } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const interviews = await getInterviewList();

  const interviewUrls = interviews.map((interview) => ({
    url: `${baseUrl}${routes.interviewLP(interview.slug)}`,
    lastModified: new Date(interview.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticUrls = [routes.guide(), routes.about()].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...interviewUrls,
    ...staticUrls,
  ];
}
