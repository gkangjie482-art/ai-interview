"use client";

import { Menu } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { NAV_LINKS } from "@/components/layouts/nav-links";
import { Button } from "@/components/ui/button";
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
        </nav>
      </PopoverContent>
    </Popover>
  );
}
