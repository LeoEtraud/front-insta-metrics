import { useDashboardSummary, useDashboardTrends, useSyncInstagram } from "@/hooks/use-dashboard";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Eye, 
  Activity, 
  RefreshCw, 
  ArrowUpRight,
  TrendingUp,
  Share2
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// COMPONENTE DE PÁGINA DO DASHBOARD - EXIBE RESUMO DE MÉTRICAS E GRÁFICOS DE TENDÊNCIAS
export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: trends, isLoading: isTrendsLoading } = useDashboardTrends();
  const syncMutation = useSyncInstagram();

  const handleSync = () => {
    syncMutation.mutate();
  };

  const tooltipLabels: Record<string, string> = {
    followersCount: "Seguidores",
    reach: "Alcance",
    impressions: "Impressões",
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto lg:pt-6 md:pt-20 pt-20">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Visão Geral do Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitore seu desempenho no Instagram em tempo real.</p>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={syncMutation.isPending}
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Sincronizando..." : "Sincronizar Dados"}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total de Seguidores" 
              value={isSummaryLoading ? "..." : summary?.totalFollowers?.toLocaleString() || 0}
              icon={Users}
              trend={{ value: 12, label: "vs mês passado" }}
              delay={100}
            />
            <StatCard 
              title="Alcance Total" 
              value={isSummaryLoading ? "..." : summary?.totalReach?.toLocaleString() || 0}
              icon={Eye}
              trend={{ value: 8, label: "vs mês passado" }}
              delay={200}
            />
            <StatCard 
              title="Engajamento Médio" 
              value={isSummaryLoading ? "..." : `${summary?.avgEngagementRate || 0}%`}
              icon={Activity}
              trend={{ value: -2, label: "vs mês passado" }}
              delay={300}
            />
            <StatCard 
              title="Total de Posts" 
              value={isSummaryLoading ? "..." : summary?.totalPosts || 0}
              icon={Share2}
              delay={400}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Crescimento da Audiência</CardTitle>
                <CardDescription>Crescimento diário de seguidores nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isTrendsLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Carregando gráfico...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends || []}>
                      <defs>
                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: ptBR })}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-lg)'
                        }}
                        formatter={(value: number, name: string) => [value?.toLocaleString(), tooltipLabels[name] || "Seguidores"]}
                        labelFormatter={(label) => format(new Date(label), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="followersCount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorFollowers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Alcance e Impressões</CardTitle>
                <CardDescription>Comparação semanal</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {isTrendsLoading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Carregando gráfico...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends?.slice(-7) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => format(new Date(value), 'dd')}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name: string) => [value?.toLocaleString(), tooltipLabels[name] || name]}
                        labelFormatter={(label) => format(new Date(label), "d 'de' MMMM", { locale: ptBR })}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reach" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/20">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-white/20 rounded-lg">
                   <TrendingUp className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded text-white/90">+12.5%</span>
               </div>
               <h3 className="text-3xl font-bold mb-1 font-display">24.5k</h3>
               <p className="text-white/80 text-sm">Visualizações do perfil este mês</p>
             </div>
             
             <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Sincronização Automática Ativada</h3>
                <p className="text-muted-foreground text-sm">Seus dados são atualizados automaticamente a cada 4 horas.</p>
             </div>

             <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-500">
                  <ArrowUpRight className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Engajamento Alto</h3>
                <p className="text-muted-foreground text-sm">Seus Reels recentes estão performando 20% melhor que a média.</p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
