"use client"



import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e:any) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            router.push("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-8 bg-zinc-900 border-zinc-800">
                <h1 className="text-3xl font-bold text-emerald-400 mb-6">Login</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-zinc-800 border-zinc-700 text-zinc-50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-zinc-800 border-zinc-700 text-zinc-50"
                            required
                        />
                    </div>

                    {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">{error}</div>}

                    <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="text-center text-zinc-400 mt-6">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">
                        Sign up
                    </Link>
                </p>
            </Card>
        </main>
    )
}
