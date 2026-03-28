import { ConfiguracaoForm } from "@/components/configuracao/ConfiguracaoForm";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ConfiguracaoPage() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-background pt-4 pb-3 mb-6 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">Configurações</h1>
            <p className="text-sm text-muted-foreground">Personalize o sistema conforme sua preferência</p>
          </div>
        </div>
      </div>
      <ConfiguracaoForm />
    </div>
  );
}
