
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Users, Settings, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { usePathname } from "next/navigation";

const menuItems = [
{ icon: LayoutDashboard, label: "Dashboard", href: "/" },
{ icon: CheckSquare, label: "Tasks", badge: "124", href: "/tasks" },
{ icon: Calendar, label: "Calendar", href: "/calendar" },
{ icon: BarChart3, label: "Analytics", href: "/analytics" },
{ icon: Users, label: "Team", href: "/team" }];


const generalItems = [
{ icon: Settings, label: "Settings", href: "/settings" },
{ icon: HelpCircle, label: "Help", href: "/help" },
{ icon: LogOut, label: "Logout", href: "/logout" }];


export function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-64 bg-card border-r border-border p-4 h-screen overflow-y-auto lg:block">
      <div className="flex items-center gap-2 mb-6 group cursor-pointer">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-300 relative">
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
              style={{ top: "30%", left: "30%" }} />
            
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute"
              style={{ top: "30%", right: "30%" }} />
            
            <div className="w-3 h-1.5 border-b-2 border-primary-foreground rounded-full absolute bottom-2.5" />
          </div>
          <span className="text-lg font-semibold text-foreground">Tasko</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive ?
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20" :
                    "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === item.label && !isActive && "translate-x-1"
                  )}>
                  
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge &&
                  <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  }
                </Link>);

            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">General</p>
          <nav className="space-y-0.5">
            {generalItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive ?
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/20" :
                    "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    hoveredItem === item.label && !isActive && "translate-x-1"
                  )}>
                  
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>);

            })}
          </nav>
        </div>
      </div>
    </aside>);

}