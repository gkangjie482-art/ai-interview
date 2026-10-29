/**
 * 送信ショートカットの表示名。Mac（iPad 含む Apple 製端末）は ⌘、それ以外は Ctrl。
 */
export function getSubmitShortcutLabel(platform: string): string {
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘+Enter" : "Ctrl+Enter";
}
