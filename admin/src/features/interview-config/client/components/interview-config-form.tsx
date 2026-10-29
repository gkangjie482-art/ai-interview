"use client";

import {
  parsePromptOverridesByMode,
  type PromptOverridesByMode,
} from "@mirai-gikai/shared/interview-prompts/sections";
import type { InterviewMode } from "@mirai-gikai/shared/interview-prompts/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { MutableRefObject } from "react";
import { useEffect, useState } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateInterviewConfig } from "../../server/actions/upsert-interview-config";
import {
  arrayToText,
  type InterviewConfig,
  type InterviewConfigInput,
  interviewConfigSchema,
  textToArray,
} from "../../shared/types";
import {
  CHAT_MODEL_GROUPS,
  DEFAULT_MODEL_LABEL,
} from "../../shared/utils/chat-model-options";
import { PromptOverridesFields } from "./prompt-overrides-fields";

interface InterviewConfigFormProps {
  config: InterviewConfig;
  aiGeneratedThemes?: string[] | null;
  onAiThemesApplied?: () => void;
  getFormValuesRef?: MutableRefObject<
    | (() => {
        mode: string;
        themes: string[];
        chat_model: string | null;
        estimated_duration: number | null;
        prompt_overrides: PromptOverridesByMode;
      })
    | null
  >;
}

export function InterviewConfigForm({
  config,
  aiGeneratedThemes,
  onAiThemesApplied,
  getFormValuesRef,
}: InterviewConfigFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InterviewConfigInput>({
    resolver: zodResolver(interviewConfigSchema),
    defaultValues: {
      mode: config.mode || "loop",
      themes: config.themes || [],
      chat_model: config.chat_model || null,
      estimated_duration: config.estimated_duration ?? 10,
      prompt_overrides: parsePromptOverridesByMode(config.prompt_overrides),
    },
  });

  // 親コンポーネントからフォーム値を読み取れるようにする
  useEffect(() => {
    if (getFormValuesRef) {
      getFormValuesRef.current = () => {
        const values = form.getValues();
        return {
          mode: values.mode,
          themes: values.themes || [],
          chat_model: values.chat_model || null,
          estimated_duration: values.estimated_duration ?? null,
          prompt_overrides: parsePromptOverridesByMode(values.prompt_overrides),
        };
      };
    }
  }, [form, getFormValuesRef]);

  // AI生成テーマの反映
  useEffect(() => {
    if (aiGeneratedThemes && aiGeneratedThemes.length > 0) {
      form.setValue("themes", aiGeneratedThemes, { shouldDirty: true });
      onAiThemesApplied?.();
      toast.success(`AIが${aiGeneratedThemes.length}件のテーマを設定しました`);
    }
  }, [aiGeneratedThemes, form, onAiThemesApplied]);

  const handleSubmit = async (data: InterviewConfigInput) => {
    setIsSubmitting(true);
    try {
      const result = await updateInterviewConfig(config.id, data);
      if (result.success) {
        toast.success("AI設定を保存しました");
        router.refresh();
      } else {
        toast.error(result.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("Error submitting interview config:", error);
      toast.error("予期しないエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI設定</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>インタビューモード</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="モードを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="loop">逐次深掘り（loop）</SelectItem>
                        <SelectItem value="bulk">一括深掘り（bulk）</SelectItem>
                        <SelectItem value="targeted">
                          対象者指定（targeted）
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      loop: 質問ごとに深掘り / bulk:
                      事前定義質問を先にすべて消化してから深掘り / targeted:
                      質問ごとに対象者条件を設定し、該当しないインタビュイーにはスキップ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chat_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AIモデル</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "__default__" ? null : value)
                      }
                      value={field.value ?? "__default__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="モデルを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__default__">
                          デフォルト（{DEFAULT_MODEL_LABEL}）
                        </SelectItem>
                        {CHAT_MODEL_GROUPS.map((group) => (
                          <SelectGroup key={group.provider}>
                            <SelectLabel>{group.provider}</SelectLabel>
                            {group.options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                                {option.estimatedCost && (
                                  <span className="ml-2 text-muted-foreground">
                                    {option.estimatedCost}/回
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      インタビュー対話に使用するAIモデルを選択します。コストは1インタビューあたりの推定値です。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目安時間（分）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="例: 15"
                        min={1}
                        max={180}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? null : Number.parseInt(val, 10)
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      設定するとインタビュー中に残り時間が表示されます。未設定の場合は時間制限なしです。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="themes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>質問テーマ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="質問テーマを改行区切りで入力"
                        className="min-h-[100px] resize-y"
                        value={arrayToText(field.value)}
                        onChange={(e) => {
                          field.onChange(textToArray(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      質問テーマを1行ずつ入力してください
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PromptOverridesFields form={form} mode={form.watch("mode")} />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
