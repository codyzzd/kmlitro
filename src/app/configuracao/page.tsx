import { ConfiguracaoForm } from "@/components/configuracao/ConfiguracaoForm";

export default function ConfiguracaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o sistema conforme sua preferência</p>
      </div>
      <ConfiguracaoForm />
    </div>
  );
}
