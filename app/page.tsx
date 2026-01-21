import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-400">My Blog</h1>
          <div className="flex gap-2">
            <Link href="/editor">
              <Button className="bg-emerald-600 hover:bg-emerald-700">New Post</Button>
            </Link>
            <form action="/auth/logout" method="post">
              <Button variant="outline" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-emerald-600 transition-colors cursor-pointer">
                  <h2 className="text-2xl font-bold text-emerald-400 mb-2">{post.title}</h2>
                  {post.excerpt && <p className="text-zinc-400 mb-4">{post.excerpt}</p>}
                  <p className="text-sm text-zinc-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-zinc-400 mb-4">No posts yet. Create your first one!</p>
            <Link href="/editor">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Create Post</Button>
            </Link>
          </Card>
        )}
      </div>
    </main>
  )
}
