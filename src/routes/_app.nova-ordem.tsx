import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Odontograma } from "@/components/Odontograma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarData, formatarTamanho } from "@/lib/ordens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/nova-ordem")({
  head: () => ({
    meta: [
      { title: "Nova ordem — LAB PIGATTO" },
      { name: "description", content: "Abertura de ordem de serviço de prótese dentária." },
      { property: "og:title", content: "Nova ordem — LAB PIGATTO" },
      { property: "og:description", content: "Envie uma nova ordem de serviço ao LAB PIGATTO." },
    ],
  }),
  component: NovaOrdem,
});

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {titulo}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function useCatalogo(tabela: "item_types" | "materials" | "implant_systems" | "scanbodies" | "tooth_shades") {
  return useQuery({
    queryKey: ["catalogo", tabela],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tabela)
        .select("id, nome, ativo")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function NovaOrdem() {
  const navigate = useNavigate();
  const { clinicId, clinicNome, role, userId, nomeCompleto, email } = useAuth();
  const isLab = role === "laboratorio";

  // O laboratório apenas analisa as ordens — não pode abrir novas.
  useEffect(() => {
    if (isLab) navigate({ to: "/dashboard", replace: true });
  }, [isLab, navigate]);

  const { data: itemTypes = [] } = useCatalogo("item_types");
  const { data: materiais = [] } = useCatalogo("materials");
  const { data: implantes = [] } = useCatalogo("implant_systems");
  const { data: scanbodies = [] } = useCatalogo("scanbodies");
  const { data: cores = [] } = useCatalogo("tooth_shades");

  const { data: clinicas = [] } = useQuery({
    queryKey: ["clinicas-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [paciente, setPaciente] = useState("");
  const [dentista, setDentista] = useState("");
  const [item, setItem] = useState("");
  const [elementos, setElementos] = useState<number[]>([]);
  const [sobImplante, setSobImplante] = useState(false);
  const [implante, setImplante] = useState("");
  const [scanbody, setScanbody] = useState("");
  const [material, setMaterial] = useState("");
  const [cor, setCor] = useState("");
  const [dataEntrega, setDataEntrega] = useState<Date | undefined>(undefined);
  const [observacoes, setObservacoes] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [fotos, setFotos] = useState<File[]>([]);
  const [clinicaSelecionada, setClinicaSelecionada] = useState("");
  const [enviando, setEnviando] = useState(false);

  const previews = useMemo(() => fotos.map((f) => ({ nome: f.name, url: URL.createObjectURL(f) })), [fotos]);
  const clinicaFinal = isLab ? clinicaSelecionada : (clinicId ?? "");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente.trim()) {
      toast.error("Informe o nome do paciente.");
      return;
    }
    if (!dataEntrega) {
      toast.error("Escolha a data de entrega.");
      return;
    }
    if (!clinicaFinal) {
      toast.error(
        isLab ? "Selecione a clínica da ordem." : "Sua conta não está vinculada a uma clínica.",
      );
      return;
    }


    setEnviando(true);
    try {
      const { data: ordem, error } = await supabase
        .from("orders")
        .insert({
          clinic_id: clinicaFinal,
          created_by: userId!,
          paciente: paciente.trim(),
          dentista: dentista.trim() || null,
          item: item || null,
          elementos,
          sob_implante: sobImplante,
          implante: sobImplante ? implante || null : null,
          scanbody: sobImplante ? scanbody || null : null,
          material: material || null,
          cor: cor || null,
          data_entrega: toISO(dataEntrega),
          observacoes: observacoes.trim() || null,
        })
        .select("id, numero")
        .single();

      if (error || !ordem) throw error ?? new Error("Falha ao criar a ordem.");

      const enviarArquivos = async (lista: File[], tipo: "arquivo" | "foto") => {
        for (const file of lista) {
          const path = `${ordem.id}/${tipo}s/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
          const { error: upErr } = await supabase.storage.from("ordens").upload(path, file);
          if (upErr) throw upErr;
          const { error: insErr } = await supabase.from("order_files").insert({
            order_id: ordem.id,
            tipo,
            storage_path: path,
            nome_arquivo: file.name,
            tamanho: file.size,
          });
          if (insErr) throw insErr;
        }
      };

      await enviarArquivos(arquivos, "arquivo");
      await enviarArquivos(fotos, "foto");

      await supabase.from("order_events").insert({
        order_id: ordem.id,
        status: "Recebida",
        comentario: "Ordem enviada pela clínica.",
        autor: nomeCompleto || email || "Sistema",
      });

      toast.success(`Ordem ${ordem.numero} enviada`);
      navigate({ to: "/ordens/$id", params: { id: ordem.id } });
    } catch (err) {
      toast.error("Não foi possível enviar a ordem", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setEnviando(false);
    }
  };

  if (isLab) {
    return (
      <AppLayout titulo="Nova ordem de serviço">
        <p className="text-sm text-muted-foreground">
          O laboratório apenas analisa as ordens recebidas. Redirecionando…
        </p>
      </AppLayout>
    );
  }

  return (
    <AppLayout titulo="Nova ordem de serviço" descricao="Preencha os dados do trabalho protético">
      <form onSubmit={enviar} className="mx-auto grid max-w-3xl gap-5">
        <Secao titulo="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nº da ordem</Label>
              <Input value="Gerado automaticamente" readOnly className="numeric bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Clínica</Label>
              {isLab ? (
                <Select value={clinicaSelecionada} onValueChange={setClinicaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={clinicNome ?? "—"} readOnly className="bg-muted" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paciente">Paciente *</Label>
              <Input
                id="paciente"
                required
                maxLength={120}
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Nome do paciente"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dentista">Dentista responsável</Label>
              <Input
                id="dentista"
                maxLength={120}
                value={dentista}
                onChange={(e) => setDentista(e.target.value)}
                placeholder="Dr(a)."
              />
            </div>
          </div>
        </Secao>

        <Secao titulo="Trabalho">
          <div className="space-y-1.5">
            <Label>Item / tipo de trabalho</Label>
            <Select value={item} onValueChange={setItem}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de trabalho" />
              </SelectTrigger>
              <SelectContent>
                {itemTypes.map((t) => (
                  <SelectItem key={t.id} value={t.nome}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Elemento (dente)</Label>
            <Odontograma selecionados={elementos} onChange={setElementos} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
            <div>
              <Label htmlFor="implante-switch">Sob implante?</Label>
              <p className="text-xs text-muted-foreground">
                {sobImplante ? "Sim" : "Não"} — informe o sistema e o scanbody se aplicável
              </p>
            </div>
            <Switch id="implante-switch" checked={sobImplante} onCheckedChange={setSobImplante} />
          </div>

          {sobImplante && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Sistema de implante</Label>
                <Select value={implante} onValueChange={setImplante}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    {implantes.map((i) => (
                      <SelectItem key={i.id} value={i.nome}>
                        {i.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scanbody">Scanbody</Label>
                <Input
                  id="scanbody"
                  list="scanbodies-lista"
                  value={scanbody}
                  onChange={(e) => setScanbody(e.target.value)}
                  placeholder="Selecione ou digite"
                />
                <datalist id="scanbodies-lista">
                  {scanbodies.map((s) => (
                    <option key={s.id} value={s.nome} />
                  ))}
                </datalist>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {materiais.map((m) => (
                    <SelectItem key={m.id} value={m.nome}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cor / escala VITA</Label>
              <Select value={cor} onValueChange={setCor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {cores.map((c) => (
                    <SelectItem key={c.id} value={c.nome}>
                      <span className="numeric">{c.nome}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Secao>

        <Secao titulo="Anexos">
          <div className="space-y-2">
            <Label htmlFor="arquivos">Arquivos da ordem (.stl, .ply, .zip, .pdf)</Label>
            <label
              htmlFor="arquivos"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary-soft/40"
            >
              <Upload className="size-5 text-primary" />
              Clique para selecionar arquivos
            </label>
            <input
              id="arquivos"
              type="file"
              multiple
              className="sr-only"
              accept=".stl,.ply,.zip,.pdf"
              onChange={(e) => setArquivos((a) => [...a, ...Array.from(e.target.files ?? [])])}
            />
            {arquivos.length > 0 && (
              <ul className="space-y-1.5">
                {arquivos.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm"
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="numeric text-xs text-muted-foreground">
                        {formatarTamanho(f.size)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remover ${f.name}`}
                        onClick={() => setArquivos((a) => a.filter((_, idx) => idx !== i))}
                      >
                        <X className="size-4 text-muted-foreground hover:text-danger" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fotos">Fotos</Label>
            <label
              htmlFor="fotos"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary-soft/40"
            >
              <Upload className="size-5 text-primary" />
              Tirar ou escolher fotos
            </label>
            <input
              id="fotos"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => setFotos((a) => [...a, ...Array.from(e.target.files ?? [])])}
            />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((p, i) => (
                  <div key={`${p.nome}-${i}`} className="group relative">
                    <img
                      src={p.url}
                      alt={`Pré-visualização ${p.nome}`}
                      className="aspect-square w-full rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Remover ${p.nome}`}
                      onClick={() => setFotos((a) => a.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 rounded-full bg-card/90 p-1 text-danger shadow"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Secao>

        <Secao titulo="Prazo e observações">
          <div className="space-y-1.5">
            <Label>Data de entrega *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-64",
                    !dataEntrega && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4" />
                  <span className="numeric">
                    {dataEntrega ? formatarData(toISO(dataEntrega)) : "Escolher data"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataEntrega}
                  onSelect={setDataEntrega}
                  autoFocus
                  className={cn("pointer-events-auto p-3")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              rows={4}
              maxLength={2000}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Detalhes de oclusão, contatos proximais, preferências do dentista…"
            />
          </div>
        </Secao>

        <div className="flex justify-end gap-3 pb-4">
          <Button type="submit" size="lg" disabled={enviando}>
            {enviando && <Loader2 className="size-4 animate-spin" />}
            {enviando ? "Enviando…" : "Enviar ordem"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
