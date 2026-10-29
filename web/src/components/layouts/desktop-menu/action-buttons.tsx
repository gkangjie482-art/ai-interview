import { LinkButton } from "@/components/top/link-button";
import { EXTERNAL_LINKS } from "@/config/external-links";

/**
 * デスクトップメニュー: アクションボタン（サイドバー内）
 */
export function DesktopMenuActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      <LinkButton
        href={EXTERNAL_LINKS.GITHUB_REPO}
        icon={{
          src: "/icons/sns/icon_web.svg",
          alt: "",
          width: 20,
          height: 20,
        }}
      >
        ソースコード
      </LinkButton>
    </div>
  );
}
