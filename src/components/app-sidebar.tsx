import { Home, Users, Trash2, Receipt, Banknote, User2, BadgeCent, CheckSquare, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.jpg";

const adminMenuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Data Nasabah", url: "/nasabah", icon: Users },
  { title: "Jenis Sampah", url: "/jenis-sampah", icon: Trash2 },
  { title: "Transaksi", url: "/transaksi", icon: Receipt },
  { title: "Persetujuan Cashout", url: "/cashout-approval", icon: CheckSquare },
  { title: "Laporan Transaksi", url: "/laporan-transaksi", icon: FileText },
  { title: "Profile", url: "/profile", icon: User2 },
];

const userMenuItems = [
  { title: "Profile", url: "/profile", icon: User2 },
  { title: "History Transaksi", url: "/history-transaksi", icon: BadgeCent },
  { title: "Cashout", url: "/cashout", icon: Banknote },
];

export function AppSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        setIsAdmin(!!roleData);
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  if (loading) {
    return (
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Bank Sampah Logo" className="h-12 w-12 rounded-full" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">SiBasTara</span>
              <span className="text-xs text-muted-foreground">Bank Sampah</span>
            </div>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bank Sampah Logo" className="h-12 w-12 rounded-full" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">SiBasTara</span>
            <span className="text-xs text-muted-foreground">Bank Sampah</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manajemen Bank Sampah</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-2 bg-sidebar-accent text-accent font-medium"
                          : "flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
