import { type APIRequestContext } from "@playwright/test";

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

/**
 * Generates unique article content.
 */
export function generateArticleData(): ArticleData {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    title: `E2E Playwright Automation ${randomSuffix}`,
    description: "Testing API object creation via helpers",
    body: "This is a **markdown-supported** body payload used in end-to-end tests.",
    tagList: ["playwright", "e2e"],
  };
}

/**
 * Creates an article via API to speed up test setup.
 * Requires a valid JWT token.
 * @returns The generated slug.
 */
export async function createArticleViaApi(
  request: APIRequestContext,
  token: string,
  data: ArticleData
): Promise<string> {
  const response = await request.post("https://api.realworld.show/api/articles", {
    data: { article: data },
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create article: ${await response.text()}`);
  }

  const json = await response.json();
  return json.article.slug;
}
