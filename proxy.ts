import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "./lib/supabase/client";

export async function proxy(request: Request) {
    const responce = NextResponse.next({
        request:{
            headers: request.headers
        }
    });

    const supabase = await createClient();

    await supabase.auth.getUser();

    return responce;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};