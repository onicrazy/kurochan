-- Criação do esquema para o sistema Kurochan
CREATE SCHEMA IF NOT EXISTS kurochan;

-- Tabela de Usuários (para sistema de login)
CREATE TABLE kurochan.usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL, -- Será armazenado com hash
    funcao VARCHAR(20) NOT NULL DEFAULT 'operador', -- administrador, gerente, operador
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    idioma_preferido VARCHAR(5) NOT NULL DEFAULT 'pt-BR', -- 'pt-BR' ou 'ja'
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Funcionários
CREATE TABLE kurochan.funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_japones VARCHAR(100),
    endereco TEXT,
    telefone VARCHAR(20),
    cargo VARCHAR(30) NOT NULL, -- motorista, auxiliar, etc.
    valor_diaria DECIMAL(10, 2) NOT NULL, -- Valor em Iene Japonês (JPY)
    valor_meio_periodo DECIMAL(10, 2), -- Valor meio período em JPY (opcional)
    data_admissao DATE,
    documento VARCHAR(30), -- Documento de identificação
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Empresas
CREATE TABLE kurochan.empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_japones VARCHAR(100),
    endereco TEXT,
    contato_nome VARCHAR(100),
    contato_telefone VARCHAR(20),
    contato_email VARCHAR(100),
    valor_padrao_servico DECIMAL(10, 2) NOT NULL, -- Valor padrão em JPY
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tipos de Serviço
CREATE TABLE kurochan.tipos_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_japones VARCHAR(100),
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alocações (Dias trabalhados pelos funcionários em empresas)
CREATE TABLE kurochan.alocacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES kurochan.empresas(id),
    funcionario_id INTEGER REFERENCES kurochan.funcionarios(id),
    data_alocacao DATE NOT NULL,
    tipo_periodo VARCHAR(20) NOT NULL DEFAULT 'integral', -- 'integral', 'meio'
    valor_pago_funcionario DECIMAL(10, 2) NOT NULL, -- Valor pago ao funcionário em JPY
    valor_cobrado_empresa DECIMAL(10, 2) NOT NULL, -- Valor cobrado da empresa em JPY
    tipo_servico_id INTEGER REFERENCES kurochan.tipos_servico(id),
    local_servico TEXT,
    descricao_servico TEXT,
    status_pagamento_funcionario VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'pago'
    status_pagamento_empresa VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'pago'
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pagamentos aos Funcionários
CREATE TABLE kurochan.pagamentos_funcionarios (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES kurochan.funcionarios(id),
    data_pagamento DATE NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL, -- Valor total em JPY
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    metodo_pagamento VARCHAR(30),
    numero_referencia VARCHAR(50), -- Número de referência do pagamento
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para detalhar quais alocações estão incluídas em cada pagamento
CREATE TABLE kurochan.pagamento_funcionario_detalhes (
    pagamento_id INTEGER REFERENCES kurochan.pagamentos_funcionarios(id),
    alocacao_id INTEGER REFERENCES kurochan.alocacoes(id),
    valor DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (pagamento_id, alocacao_id)
);

-- Tabela de Faturas para Empresas
CREATE TABLE kurochan.faturas_empresas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES kurochan.empresas(id),
    data_fatura DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL, -- Valor total em JPY
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'pago', 'parcial'
    metodo_pagamento VARCHAR(30),
    numero_referencia VARCHAR(50), -- Número de referência do pagamento
    observacoes TEXT,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para detalhar quais alocações estão incluídas em cada fatura
CREATE TABLE kurochan.fatura_empresa_detalhes (
    fatura_id INTEGER REFERENCES kurochan.faturas_empresas(id),
    alocacao_id INTEGER REFERENCES kurochan.alocacoes(id),
    valor DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (fatura_id, alocacao_id)
);

-- Índices para melhorar performance
CREATE INDEX idx_funcionarios_nome ON kurochan.funcionarios(nome);
CREATE INDEX idx_empresas_nome ON kurochan.empresas(nome);
CREATE INDEX idx_alocacoes_data ON kurochan.alocacoes(data_alocacao);
CREATE INDEX idx_alocacoes_empresa_funcionario ON kurochan.alocacoes(empresa_id, funcionario_id);
CREATE INDEX idx_alocacoes_status_pag_func ON kurochan.alocacoes(status_pagamento_funcionario);
CREATE INDEX idx_alocacoes_status_pag_emp ON kurochan.alocacoes(status_pagamento_empresa);
