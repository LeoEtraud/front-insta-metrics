import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart2, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Content", href: "/content", icon: ImageIcon },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

// COMPONENTE DE MENU LATERAL - NAVEGAÇÃO PRINCIPAL COM LINKS E BOTÃO DE LOGOUT
export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detecta scroll para ocultar botão do menu no mobile
  useEffect(() => {
    const handleScroll = () => {
      // Verifica se está em mobile (largura <= 1024px que é o breakpoint lg)
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return;

      // Obtém a posição do scroll
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      // Oculta o botão quando o scroll for maior que 50px
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verifica inicialmente
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg">
            <BarChart2 className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">Insta Metrics</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-6 mt-auto">
        <div className="bg-card border border-border/50 rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 border-border/60" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className={cn(
        "lg:hidden fixed top-4 left-4 z-50 transition-all duration-300",
        isScrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100 pointer-events-auto translate-y-0"
      )}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-11 w-11 shadow-lg hover:shadow-xl bg-background/95 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-xl h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}
