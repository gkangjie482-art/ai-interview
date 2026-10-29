"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { isInterviewPage } from "@/lib/page-layout-utils";
import { routes } from "@/lib/routes";
import { HamburgerMenu } from "./hamburger-menu";

export function HeaderClient() {
  const pathname = usePathname();
  const showInterviewActions = isInterviewPage(pathname);

  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-40 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-white shadow-sm mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center">
            <Link
              href={routes.home()}
              className="flex items-center space-x-2"
              aria-label="ホーム"
            >
              <Image
                src="/img/logo.svg"
                alt="AIインタビュー"
                width={42}
                height={36}
              />
              <Image
                src="/img/service-logo.svg"
                alt="AIインタビュー"
                width={115}
                height={21}
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center space-x-2"
            aria-label="補助ナビゲーション"
          >
            {showInterviewActions && <InterviewHeaderActions />}
            <HamburgerMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}
