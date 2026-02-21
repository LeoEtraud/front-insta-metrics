import { useAuth } from "@/hooks/use-auth";
import { useInstagramPosts } from "@/hooks/use-dashboard";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Eye, Play } from "lucide-react";

const mediaTypeLabels: Record<string, string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  REELS: "Reels",
  CAROUSEL_ALBUM: "Carrossel",
};

// COMPONENTE DE PÁGINA DE PERFORMANCE DE CONTEÚDO - EXIBE POSTS DO INSTAGRAM COM MÉTRICAS DETALHADAS
export default function Content() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? null;
  const { data: posts, isLoading } = useInstagramPosts(companyId);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto lg:pt-6 md:pt-20 pt-20">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          {!companyId && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200">
              <p className="font-medium">Nenhuma empresa vinculada</p>
              <p className="text-sm mt-1">
                Entre em contato com o administrador para vincular seu usuário a uma empresa.
              </p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Desempenho do Conteúdo</h1>
              <p className="text-muted-foreground mt-1">Métricas detalhadas dos seus posts recentes.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts?.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="overflow-hidden border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {post.mediaUrl ? (
                      <img 
                        src={post.mediaUrl} 
                        alt={post.caption || "Post do Instagram"} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <span className="text-muted-foreground">Sem Mídia</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border-0">
                        {post.mediaType === 'VIDEO' || post.mediaType === 'REELS' ? <Play className="w-3 h-3 mr-1" /> : null}
                        {mediaTypeLabels[post.mediaType] || post.mediaType}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                      {post.caption || "Sem legenda"}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-border/50">
                      <div className="flex flex-col items-center">
                        <Heart className="w-4 h-4 text-rose-500 mb-1" />
                        <span className="font-bold text-sm">{post.metrics?.likes || 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Curtidas</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-border/50">
                        <MessageCircle className="w-4 h-4 text-blue-500 mb-1" />
                        <span className="font-bold text-sm">{post.metrics?.comments || 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Comentários</span>
                      </div>
                      <div className="flex flex-col items-center border-l border-border/50">
                        <Eye className="w-4 h-4 text-emerald-500 mb-1" />
                        <span className="font-bold text-sm">{post.metrics?.reach || 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Alcance</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground text-center">
                      Publicado em {format(new Date(post.timestamp), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {posts?.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted-foreground text-lg">Nenhum post encontrado. Tente sincronizar os dados pelo Dashboard.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
