"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { NAV_LINKS } from "@/components/layouts/nav-links";
import { Button } from "@/components/ui/button";
import { EXTERNAL_LINKS } from "@/config/external-links";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function HamburgerMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <nav aria-label="メインメニュー" className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as Route}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mirai-surface"
            >
              {link.label}
            </Link>
          ))}
          {/* AGPL-3.0 第13条のソースコード公開先と、fork ガイドラインの免責文言。
              フッターを出さないチャット画面でも辿れるようにメニューにも置く */}
          <a
            href={EXTERNAL_LINKS.GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-mirai-surface"
          >
            ソースコード
          </a>
        </nav>
        <p className="mt-1 border-t border-mirai-border px-3 pt-2 pb-1 text-[11px] leading-[1.6] text-mirai-text-secondary">
          これは政党チームみらいが運営しているものではありません
        </p>
      </PopoverContent>
    </Popover>
  );
}
