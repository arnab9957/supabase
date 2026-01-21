import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SignupSuccessPage() {
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-8 bg-zinc-900 border-zinc-800 text-center">
                <h1 className="text-3xl font-bold text-emerald-400 mb-4">Check Your Email</h1>
                <p className="text-zinc-400 mb-6">
                    We've sent you a confirmation link. Please check your email to verify your account.
                </p>
                <Link href="/auth/login">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Back to Login</Button>
                </Link>
            </Card>
        </main>
    )
}
