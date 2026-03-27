import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StoreInitializer } from "@/components/layout/StoreInitializer";
import { createClient } from "@/utils/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <StoreInitializer userId={user.id} />
      <AppSidebar />
      <main className="flex flex-col flex-1 min-h-screen">
        <div className="flex items-center p-2 border-b">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
