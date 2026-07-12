import SidebarG from "@/components/layout/sidebar-g/sidebar-g";
import { SidebarProvider, SidebarInset, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
        <SidebarG />
          <div className="flex-1 p-4 min-h-0 min-w-0">
            {children}
          </div>
      <SidebarRail />
    </SidebarProvider>
  );
}
