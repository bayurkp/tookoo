import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export interface NavMainItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    badge?: string;
  }[];
}

export function NavMain({
  items,
  label = 'Menu Aplikasi',
}: {
  items: NavMainItem[];
  label?: string;
}) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const currentType = searchParams.get('type');

  const isSubItemActive = (url: string) => {
    if (url === '/') {
      return location.pathname === '/';
    }
    if (url.includes('?')) {
      const [path, query] = url.split('?');
      const params = new URLSearchParams(query);
      const expectedTab = params.get('tab');
      const expectedType = params.get('type');

      if (expectedTab) {
        return location.pathname === path && currentTab === expectedTab;
      }
      if (expectedType) {
        return location.pathname === path && currentType === expectedType;
      }
      return location.pathname === path;
    }
    return location.pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const hasItems = Boolean(item.items?.length);
          const isItemActive =
            item.isActive ||
            (item.items && item.items.some((sub) => isSubItemActive(sub.url))) ||
            location.pathname === item.url;

          if (!hasItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  tooltip={item.title}
                >
                  <NavLink to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isItemActive} tooltip={item.title}>
                  <NavLink to={item.items![0].url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>

                <CollapsibleTrigger asChild>
                  <SidebarMenuAction className="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span className="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isSubItemActive(subItem.url)}>
                          <NavLink to={subItem.url}>
                            <span>{subItem.title}</span>
                            {subItem.badge && (
                              <span className="ml-auto text-[9px] px-1 py-0 rounded border border-muted-foreground/30 text-muted-foreground font-normal">
                                {subItem.badge}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
