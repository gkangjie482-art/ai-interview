import { describe, expect, it } from "vitest";
import { POST } from "./route";

function buildCompleteRequest(body: unknown): Request {
  return new Request("http://localhost/api/interview/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/interview/complete", () => {
  it("sessionId がない場合は400を返す", async () => {
    const res = await POST(buildCompleteRequest({}));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing sessionId" });
  });

  it("未認証の場合は403を返す", async () => {
    const res = await POST(
      buildCompleteRequest({
        sessionId: "00000000-0000-0000-0000-000000000000",
      })
    );

    expect(res.status).toBe(403);
  });
});
