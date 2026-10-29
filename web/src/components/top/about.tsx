import Image from "next/image";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { LinkButton } from "./link-button";

export function About() {
  return (
    <div className="py-10">
      <div className="flex flex-col gap-4">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <h2>
            <Image
              src="/icons/about-typography.svg"
              alt="About"
              width={143}
              height={36}
              priority
            />
          </h2>
          <p className="text-sm font-bold text-primary-accent">
            AIインタビューとは
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold leading-[43.2px]">
              あなたの声を
              <br />
              AIがていねいに聞き取ります
            </h3>
            <p className="text-[15px] leading-[28px] text-black">
              AIインタビューは、法案やテーマについてわかりやすく解説し、AIとの対話を通じてあなたの意見をお聞きするサービスです。オープンソースの「みらい議会」をもとに個人が運営しています。これは政党チームみらいが運営しているものではありません。
            </p>
          </div>

          {/* ソースコードへのリンク（AGPL-3.0） */}
          <LinkButton
            href={EXTERNAL_LINKS.GITHUB_REPO}
            icon={{
              src: "/icons/sns/icon_web.svg",
              alt: "",
              width: 25,
              height: 25,
            }}
          >
            ソースコードを見る
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
