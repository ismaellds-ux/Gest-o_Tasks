export type Quadro = "tasks1" | "tasks2";
export type Tipo = "interna" | "externa";
export type Periodicidade = "unica" | "diario" | "semanal" | "mensal";
export type StatusTarefa = "pendente" | "em_aberto" | "concluida" | "cancelada";
export type FiltroStatus = "todas" | "em_aberto" | "pendentes" | "concluidas" | "canceladas";

export type Turno = "manha" | "tarde" | "noite";
export type RespostaChecklist = "ok" | "problema" | "nao_aplica";

// Tipos de linha usam `type` (não `interface`): interfaces quebram a inferência
// genérica profunda do postgrest-js (Row/Insert/Update colapsam para `never`).
export type Tarefa = {
  id: string;
  quadro: Quadro;
  tipo: Tipo;
  o_que: string;
  descricao: string | null;
  quando: string; // date (YYYY-MM-DD)
  quem: string;
  atribuido_por: string | null;
  local: string | null;
  cidade: string | null;
  periodicidade: Periodicidade;
  concluida: boolean;
  concluido_por: string | null;
  cancelada: boolean;
  motivo_cancelamento: string | null;
  cancelado_por: string | null;
  cancelado_em: string | null;
  criado_por: string;
  criado_em: string;
  origem_checklist_item_id: string | null;
  origem_checklist_execucao_id: string | null;
};

export type Adiamento = {
  id: string;
  tarefa_id: string;
  data_registro: string;
  data_anterior: string;
  nova_data: string;
  motivo: string;
};

export type Conclusao = {
  id: string;
  tarefa_id: string;
  data_conclusao: string;
  data_prevista: string;
  descricao_snapshot: string | null;
  tipo_snapshot: Tipo | null;
  local_snapshot: string | null;
  cidade_snapshot: string | null;
  concluido_por: string;
};

export type CampoAlterado =
  | "tipo"
  | "o_que"
  | "descricao"
  | "quando"
  | "quem"
  | "local"
  | "cidade"
  | "periodicidade"
  | "atribuido_por";

export type Mudancas = Partial<Record<CampoAlterado, { de: string | null; para: string | null }>>;

export type Alteracao = {
  id: string;
  tarefa_id: string;
  alterado_por: string;
  alterado_em: string;
  mudancas: Mudancas;
};

export type Usuario = {
  id: string;
  usuario: string;
  is_admin: boolean;
  criado_em: string;
  janela_tasks1_inicio: string | null;
  janela_tasks1_fim: string | null;
};

export type ChecklistArea = {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
};

export type ChecklistItem = {
  id: string;
  area_id: string;
  pergunta: string;
  resposta_ok_texto: string;
  resposta_problema_texto: string;
  resposta_na_texto: string;
  permite_tarefa_automatica: boolean;
  ordem: number;
  ativo: boolean;
  criado_em: string;
};

export type ChecklistExecucao = {
  id: string;
  turno: Turno;
  data: string;
  realizado_por: string;
  criado_em: string;
};

export type ChecklistResposta = {
  id: string;
  execucao_id: string;
  item_id: string;
  resposta: RespostaChecklist;
  observacao: string | null;
};

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario;
        Insert: Partial<Usuario> & { id: string; usuario: string };
        Update: Partial<Usuario>;
        Relationships: [];
      };
      tarefas: {
        Row: Tarefa;
        Insert: Omit<
          Tarefa,
          | "id"
          | "criado_em"
          | "concluida"
          | "concluido_por"
          | "cancelada"
          | "motivo_cancelamento"
          | "cancelado_por"
          | "cancelado_em"
          | "atribuido_por"
          | "origem_checklist_item_id"
          | "origem_checklist_execucao_id"
        > &
          Partial<
            Pick<
              Tarefa,
              | "id"
              | "criado_em"
              | "concluida"
              | "concluido_por"
              | "cancelada"
              | "motivo_cancelamento"
              | "cancelado_por"
              | "cancelado_em"
              | "atribuido_por"
              | "origem_checklist_item_id"
              | "origem_checklist_execucao_id"
            >
          >;
        Update: Partial<Tarefa>;
        Relationships: [];
      };
      checklist_areas: {
        Row: ChecklistArea;
        Insert: Omit<ChecklistArea, "id" | "criado_em" | "ordem" | "ativo"> &
          Partial<Pick<ChecklistArea, "id" | "criado_em" | "ordem" | "ativo">>;
        Update: Partial<ChecklistArea>;
        Relationships: [];
      };
      checklist_itens: {
        Row: ChecklistItem;
        Insert: Omit<
          ChecklistItem,
          "id" | "criado_em" | "ordem" | "ativo" | "resposta_ok_texto" | "resposta_problema_texto" | "resposta_na_texto"
        > &
          Partial<
            Pick<
              ChecklistItem,
              "id" | "criado_em" | "ordem" | "ativo" | "resposta_ok_texto" | "resposta_problema_texto" | "resposta_na_texto"
            >
          >;
        Update: Partial<ChecklistItem>;
        Relationships: [];
      };
      checklist_execucoes: {
        Row: ChecklistExecucao;
        Insert: Omit<ChecklistExecucao, "id" | "criado_em" | "data"> &
          Partial<Pick<ChecklistExecucao, "id" | "criado_em" | "data">>;
        Update: Partial<ChecklistExecucao>;
        Relationships: [];
      };
      checklist_respostas: {
        Row: ChecklistResposta;
        Insert: Omit<ChecklistResposta, "id" | "observacao"> & Partial<Pick<ChecklistResposta, "id" | "observacao">>;
        Update: Partial<ChecklistResposta>;
        Relationships: [];
      };
      adiamentos: {
        Row: Adiamento;
        Insert: Omit<Adiamento, "id" | "data_registro"> &
          Partial<Pick<Adiamento, "id" | "data_registro">>;
        Update: Partial<Adiamento>;
        Relationships: [];
      };
      conclusoes: {
        Row: Conclusao;
        Insert: Omit<Conclusao, "id" | "data_conclusao"> &
          Partial<Pick<Conclusao, "id" | "data_conclusao">>;
        Update: Partial<Conclusao>;
        Relationships: [];
      };
      alteracoes: {
        Row: Alteracao;
        Insert: Omit<Alteracao, "id" | "alterado_em"> & Partial<Pick<Alteracao, "id" | "alterado_em">>;
        Update: Partial<Alteracao>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
