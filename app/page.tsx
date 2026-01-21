import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server"


export default async function Page() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form action="/auth/logout" method="POST">
        <Button type="submit">Logout</Button>
      </form>
      {JSON.stringify(user, null, 2)}
    </div>
  );
}
