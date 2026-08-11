export type Quadro = "tasks1" | "tasks2";
export type Tipo = "interna" | "externa";
export type Periodicidade = "unica" | "diario" | "semanal" | "mensal";
export type StatusTarefa = "pendente" | "em_aberto" | "concluida" | "cancelada";
export type FiltroStatus = "todas" | "em_aberto" | "pendentes" | "concluidas" | "canceladas";

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
            >
          >;
        Update: Partial<Tarefa>;
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
