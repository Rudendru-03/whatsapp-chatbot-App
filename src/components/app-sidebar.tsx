import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Define TypeScript types for navigation items
type SubNavItem = {
  title: string;
  url: string;
  isActive?: boolean;
};

type NavItem = {
  title: string;
  url: string;
  items?: SubNavItem[]; // Optional property for sub-items
};

// Navigation data with type enforcement
const data: { navMain: NavItem[] } = {
  navMain: [
    {
      title: "Send Message",
      url: "/",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      items: [
        { title: "Analytics", url: "/dashboard/analytics", isActive: false },
        { title: "Reports", url: "/dashboard/reports", isActive: false },
      ],
    },
    {
      title: "Products",
      url: "/products",
    },
    {
      title: "Conference",
      url: "/conference",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Square Group Tech</span>
                  <span className=""></span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item: NavItem) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items && item.items.length > 0 ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem: SubNavItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                          <Link href={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
