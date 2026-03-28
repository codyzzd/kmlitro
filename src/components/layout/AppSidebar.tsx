"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Fuel, Car, Settings, ChevronsUpDown, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleSelector } from "@/components/shared/VehicleSelector";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/history", label: "Abastecimentos", icon: Fuel },
  { href: "/vehicles", label: "Veículos", icon: Car },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const supabase = createClient();
  const selectedVehicleId = useAppStore((s) => s.selectedVehicleId);
  const defaultVehicleId = useAppStore((s) => s.defaultVehicleId);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);
  const settings = useAppStore((s) => s.settings);

  // Ao montar, se não há veículo selecionado, usa o padrão
  useEffect(() => {
    if (!selectedVehicleId && defaultVehicleId) {
      setSelectedVehicleId(defaultVehicleId);
    }
  }, [selectedVehicleId, defaultVehicleId, setSelectedVehicleId]);

  const userInitials = settings.userName
    ? settings.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const displayName = settings.userName || "Usuário";
  const displayEmail = settings.userEmail || "sem e-mail configurado";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
            <Fuel className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-base truncate">KmLitro</span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Seletor de veículo global */}
        <div className="px-2 py-1 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground px-2 mb-1">Veículo ativo</p>
          <VehicleSelector
            value={selectedVehicleId}
            onChange={setSelectedVehicleId}
            placeholder="Selecione um veículo"
          />
        </div>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
                  {userInitials}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem render={<Link href="/configuracao" />}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
