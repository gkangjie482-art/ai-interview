import { describe, expect, it } from "vitest";
import { isDevRoute, isHtmlAcceptHeader } from "./middleware";

describe("isHtmlAcceptHeader", () => {
  it("should return true for text/html", () => {
    expect(isHtmlAcceptHeader("text/html")).toBe(true);
  });

  it("should return true for accept header with text/html among others", () => {
    expect(
      isHtmlAcceptHeader(
        "text/html,application/xhtml+xml,application/xml;q=0.9"
      )
    ).toBe(true);
  });

  it("should return false for application/json", () => {
    expect(isHtmlAcceptHeader("application/json")).toBe(false);
  });

  it("should return false for image/png", () => {
    expect(isHtmlAcceptHeader("image/png")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isHtmlAcceptHeader("")).toBe(false);
  });
});

describe("isDevRoute", () => {
  it("/dev と /dev/ 配下は開発用ルートと判定する", () => {
    expect(isDevRoute("/dev")).toBe(true);
    expect(isDevRoute("/dev/preview")).toBe(true);
  });

  it("/developers など /dev で始まる通常ページは対象外", () => {
    expect(isDevRoute("/developers")).toBe(false);
    expect(isDevRoute("/developers/open-data-api")).toBe(false);
  });

  it("その他のパスは対象外", () => {
    expect(isDevRoute("/")).toBe(false);
    expect(isDevRoute("/terms")).toBe(false);
  });
});
