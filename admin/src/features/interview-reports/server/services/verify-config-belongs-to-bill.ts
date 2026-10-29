import "server-only";

/**
 * インタビュー設定がインタビューに属しているか確認する。
 * 新スキーマでは設定とインタビューは同じ行なので、ID が一致すればよい。
 */
export async function verifyConfigBelongsToBill(
  configId: string,
  billId: string
): Promise<void> {
  if (configId !== billId) {
    throw new Error(
      "指定されたインタビュー設定はこのインタビューに属していません"
    );
  }
}
