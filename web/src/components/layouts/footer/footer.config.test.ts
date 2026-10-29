import { describe, expect, it } from "vitest";
import { routes } from "@/lib/routes";
import { policyLinks, primaryLinks } from "./footer.config";

describe("footer.config", () => {
  it("policyLinks に規約ページへの内部リンクが含まれる", () => {
    const hrefs = policyLinks.map((link) => link.href);

    expect(hrefs).toContain(routes.terms());
    expect(hrefs).toContain(routes.privacy());
  });

  it("primaryLinks にサービス内の主要ページが含まれる", () => {
    const hrefs = primaryLinks.map((link) => link.href);

    expect(hrefs).toContain(routes.home());
    expect(hrefs).toContain(routes.guide());
    expect(hrefs).toContain(routes.about());
    expect(hrefs).toContain(routes.history());
  });

  it("内部リンクには external フラグが付かない", () => {
    const internalHrefs = new Set<string>([
      routes.home(),
      routes.guide(),
      routes.about(),
      routes.history(),
      routes.terms(),
      routes.privacy(),
    ]);

    for (const link of [...primaryLinks, ...policyLinks]) {
      if (internalHrefs.has(link.href)) {
        expect(link.external).toBeUndefined();
      } else {
        expect(link.external).toBe(true);
      }
    }
  });
});
