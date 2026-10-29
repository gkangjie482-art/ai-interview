"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/lib/routes";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { isNextRedirectError } from "@/lib/utils/redirect";
import { createInterview } from "../../server/actions/create-interview";
import { updateInterview } from "../../server/actions/update-interview";
import {
  type Interview,
  type InterviewBasicInput,
  interviewBasicSchema,
  OPEN_STATUS_LABELS,
  PUBLISH_STATUS_LABELS,
} from "../../shared/types";
import { isoToJstLocal } from "../../shared/utils/jst-datetime";
import { ThumbnailUpload } from "./thumbnail-upload";

function toDefaultValues(interview?: Interview): InterviewBasicInput {
  return {
    name: interview?.name ?? "",
    slug: interview?.slug ?? "",
    summary: interview?.summary ?? "",
    description: interview?.description ?? "",
    background: interview?.background ?? "",
    thumbnail_url: interview?.thumbnail_url ?? null,
    publish_status: interview?.publish_status ?? "draft",
    status: interview?.status ?? "public",
    is_featured: interview?.is_featured ?? false,
    featured_order: interview?.featured_order ?? 0,
    closes_at: isoToJstLocal(interview?.closes_at ?? null),
    show_prompt: interview?.show_prompt ?? true,
  };
}

/**
 * インタビューの基本情報フォーム（新規作成・編集共通）
 */
export function InterviewBasicForm({ interview }: { interview?: Interview }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<InterviewBasicInput>({
    resolver: zodResolver(interviewBasicSchema),
    defaultValues: toDefaultValues(interview),
  });

  const onSubmit = async (values: InterviewBasicInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (interview) {
        await updateInterview(interview.id, values);
        toast.success("保存しました");
        router.refresh();
      } else {
        await createInterview(values);
      }
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setError(getErrorMessage(err, "保存中にエラーが発生しました"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="例: 地域の子育て支援についてのインタビュー"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL（slug）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="例: childcare-2026" />
                  </FormControl>
                  <FormDescription>
                    公開ページのURLが /interview/{field.value || "slug"}{" "}
                    になります。半角の英小文字・数字・ハイフンが使えます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>概要</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormDescription>
                    一覧のカードと紹介ページの冒頭に出る短い説明です（400文字以内）。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>紹介文</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[200px] resize-y" />
                  </FormControl>
                  <FormDescription>
                    紹介ページの本文です。Markdown（見出し・箇条書き・リンク）が使えます。AIにもテーマの説明として渡します。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>背景資料（AIだけが参照）</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="min-h-[200px] resize-y" />
                  </FormControl>
                  <FormDescription>
                    回答者には表示されず、AIが質問や補足説明をするときに参照します。調べてほしい論点や前提知識などを書いてください（40,000文字以内）。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>サムネイル画像</FormLabel>
                  <FormControl>
                    <ThumbnailUpload
                      value={field.value}
                      onChange={field.onChange}
                      interviewId={interview?.id}
                    />
                  </FormControl>
                  <FormDescription>
                    推奨サイズ 1200×630。SNSでシェアしたときの画像にも使います。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>公開と募集</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="publish_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公開状態</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PUBLISH_STATUS_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      下書きの間は一般公開されません（プレビューURLで確認できます）。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>募集状況</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(OPEN_STATUS_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      募集終了にすると新しい回答を受け付けず、寄せられた声だけを表示します。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="closes_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>締切（日本時間）</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    紹介ページに「〜まで」と表示します。空欄なら表示しません（自動では締め切りません）。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>注目のインタビューに表示</FormLabel>
                      <FormDescription>
                        一覧の上部（PICKUP）に大きく表示します
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表示順</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value || 0))
                        }
                      />
                    </FormControl>
                    <FormDescription>小さいほど上に表示します</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="show_prompt"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>AIへの指示（プロンプト）を公開する</FormLabel>
                    <FormDescription>
                      紹介ページに「AIへの指示（プロンプト）を見る」リンクを表示します
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "保存中..."
              : interview
                ? "保存する"
                : "作成してAI設定へ進む"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(routes.interviews() as Route)}
          >
            一覧に戻る
          </Button>
        </div>
      </form>
    </Form>
  );
}
