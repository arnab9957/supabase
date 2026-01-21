import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BlogContent } from "@/components/BlogContent" // Import BlogContent component

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: post } = await supabase.from("posts").select("*").eq("id", id).eq("user_id", user.id).single()

    if (!post) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-zinc-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/">
                        <Button variant="outline">Back</Button>
                    </Link>
                    <Link href={`/editor?id=${post.id}`}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Edit</Button>
                    </Link>
                </div>

                <Card className="p-8 bg-zinc-900 border-zinc-800">
                    <h1 className="text-4xl font-bold text-emerald-400 mb-4">{post.title}</h1>
                    <p className="text-zinc-400 mb-8">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>

                    <div className="prose prose-invert max-w-none text-zinc-300">
                        <BlogContent content={post.content} />
                    </div>
                </Card>
            </div>
        </main>
    )
}
