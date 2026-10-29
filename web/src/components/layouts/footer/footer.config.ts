import { EXTERNAL_LINKS } from "@/config/external-links";
import { routes } from "@/lib/routes";

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterPolicyLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const primaryLinks: FooterLink[] = [
  {
    label: "インタビュー一覧",
    href: routes.home(),
  },
  {
    label: "はじめての方へ",
    href: routes.guide(),
  },
  {
    label: "このサービスについて",
    href: routes.about(),
  },
  {
    label: "回答履歴",
    href: routes.history(),
  },
  {
    label: "ソースコード",
    href: EXTERNAL_LINKS.GITHUB_REPO,
    external: true,
  },
  {
    label: "本家「みらい議会」",
    href: EXTERNAL_LINKS.UPSTREAM_SERVICE,
    external: true,
  },
];

export const policyLinks: FooterPolicyLink[] = [
  {
    label: "利用規約",
    href: routes.terms(),
  },
  {
    label: "プライバシーポリシー",
    href: routes.privacy(),
  },
];
