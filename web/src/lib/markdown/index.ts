import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { ReactElement } from "react";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeEmbedYouTube } from "./rehype-embed-youtube";
import { rehypeExternalLinks } from "./rehype-external-links";
import { rehypeWrapSections } from "./rehype-wrap-sections";

// rehypeSanitizeのスキーマをカスタマイズ
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), "target", "rel"],
  },
};

/**
 * MarkdownテキストをReact Elementに変換
 * @param markdown - Markdown形式のテキスト
 * @returns React Element（部分水和対応）
 */
export async function parseMarkdown(markdown: string): Promise<ReactElement> {
  // Markdown → mdast（remarkBreaksでソフト改行をbreak nodeに変換）
  const remarkProcessor = unified().use(remarkParse).use(remarkBreaks);
  const parsed = remarkProcessor.parse(markdown);
  const mdast = (await remarkProcessor.run(parsed)) as typeof parsed;

  // mdast → hast（rehypeプラグイン適用）
  const hast = await unified()
    .use(remarkRehype)
    .use(rehypeWrapSections)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeExternalLinks)
    .use(rehypeEmbedYouTube)
    .run(mdast);

  // hast → React Element（部分水和）
  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
  });
}
