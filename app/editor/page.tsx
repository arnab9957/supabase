"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type EditorJS from "@editorjs/editorjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function EditorPage() {
    const editorRef = useRef<EditorJS | null>(null);
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get("id");

    const supabase = createClient();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let editorInstance = null;

        const initEditor = async () => {
            // Prevent multiple initializations
            if (editorRef.current) return;

            // Dynamically import EditorJS and plugins
            const EditorJS = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const Paragraph = (await import("@editorjs/paragraph")).default;
            const List = (await import("@editorjs/list")).default;
            const Quote = (await import("@editorjs/quote")).default;
            const Code = (await import("@editorjs/code")).default;
            const Image = (await import("@editorjs/image")).default;

            editorInstance = new EditorJS({
                holder: "editorjs",
                tools: {
                    header: Header,
                    paragraph: Paragraph,
                    list: List,
                    quote: Quote,
                    code: Code,
                    image: {
                        class: Image,
                        config: {
                            uploader: {
                                uploadByFile: async (file: File) => {
                                    const {
                                        data: { user },
                                    } = await supabase.auth.getUser();
                                    if (!user) throw new Error("Not authenticated");

                                    const fileName = `${Date.now()}-${file.name}`;
                                    const { error: uploadError } = await supabase.storage
                                        .from("blog-images")
                                        .upload(`${user.id}/${fileName}`, file);

                                    if (uploadError) throw uploadError;

                                    const { data } = supabase.storage
                                        .from("blog-images")
                                        .getPublicUrl(`${user.id}/${fileName}`);

                                    return {
                                        success: 1,
                                        file: {
                                            url: data.publicUrl,
                                        },
                                    };
                                },
                            },
                        },
                    },
                },
                onReady: () => {
                    console.log("Editor ready");
                    setIsEditorReady(true);
                },
            });

            editorRef.current = editorInstance;

            // Load existing post if editing
            if (postId) {
                const { data: post } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("id", postId)
                    .single();

                if (post) {
                    setTitle(post.title);
                    setExcerpt(post.excerpt || "");

                    // Parse content if it's a string
                    const content = typeof post.content === 'string'
                        ? JSON.parse(post.content)
                        : post.content;

                    await editorInstance.isReady;
                    await editorInstance.render(content);
                }
            }
        };

        initEditor();

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [postId]); // Remove supabase from dependencies

    const handleSave = async () => {
        if (!editorRef.current || !title.trim()) {
            setError("Title is required");
            return;
        }

        if (!isEditorReady) {
            setError("Editor is not ready yet");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Wait for editor to be ready and save content
            await editorRef.current.isReady;
            const content = await editorRef.current.save();

            console.log("Saving content:", content); // Debug log

            if (postId) {
                // Update existing post
                const { error: updateError } = await supabase
                    .from("posts")
                    .update({
                        title,
                        excerpt,
                        content: content, // Don't stringify - Supabase handles JSONB
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", postId)
                    .eq("user_id", user.id);

                if (updateError) throw updateError;

                alert("Post updated successfully!");
            } else {
                // Insert new post
                const { data, error: insertError } = await supabase
                    .from("posts")
                    .insert({
                        title,
                        excerpt,
                        content: content, // Don't stringify - Supabase handles JSONB
                        user_id: user.id,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                console.log("Post created:", data); // Debug log
                router.push("/");
            }
        } catch (error) {
            console.error("Save error:", error); // Debug log
            setError(error instanceof Error ? error.message : "Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {postId ? "Edit post" : "New Post"}
                    </h1>

                    <div className="flex gap-2">
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700"
                            >
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card
                    className={
                        "p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 space-y-4 transition-colors"
                    }
                >
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Title
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title..."
                            className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Excerpt
                        </label>
                        <Input
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief summary..."
                            className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50"
                        />
                    </div>

                    <div>
                        <div
                            id="editorjs"
                            className="max-w-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-4 min-h-96
              prose lg:prose-xl
               prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50
                prose-p:text-zinc-700 dark:prose-p:text-zinc-300
                prose-a:text-emerald-600 dark:prose-a:text-emerald-400
                prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50
                prose-code:text-zinc-900 dark:prose-code:text-zinc-50
                prose-code:bg-zinc-200 dark:prose-code:bg-zinc-700
                prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950
                prose-blockquote:border-emerald-500 dark:prose-blockquote:border-emerald-400
                prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300
                prose-img:rounded-lg
              "
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !isEditorReady}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {saving ? <Spinner /> : "Save Post"}
                        </Button>
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700"
                            >
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}