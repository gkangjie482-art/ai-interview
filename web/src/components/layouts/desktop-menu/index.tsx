import { DesktopMenuLogo } from "./logo";
import { DesktopMenuSidebar } from "./sidebar";

/**
 * デスクトップメニュー (画面幅1400px以上で表示)
 *
 * 構成:
 * - ロゴ: 画面左上
 * - サイドバー: 画面左下
 */
export async function DesktopMenu() {
  return (
    <div className="hidden pcl:block">
      <DesktopMenuLogo />
      <DesktopMenuSidebar />
    </div>
  );
}
