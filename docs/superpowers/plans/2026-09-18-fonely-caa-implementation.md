# Fonely CAA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma primeira versão funcional do Fonely CAA integrada ao Fonely atual, opcional por paciente e exclusiva do plano Pro.

**Architecture:** O módulo CAA será isolado em arquivos próprios, integrado ao prontuário existente pelo `patientId`. O painel profissional usará o Fonely atual e o comunicador público terá uma página própria. Dados persistentes ficarão no Supabase com RLS; o frontend nunca usará `service_role`.

**Tech Stack:** HTML, CSS, JavaScript vanilla, Web Speech API, Supabase Postgres/Auth/Storage, GitHub.

**Spec:** `docs/superpowers/specs/2026-09-18-fonely-caa-design.md`

## Global Constraints

- CAA é opcional por paciente.
- CAA é exclusivo do plano Pro.
- Pacientes sem CAA não sofrem alteração funcional.
- Desativar CAA preserva histórico e prancha.
- Link público não expõe prontuário nem outros pacientes.
- Imagens principais são pictogramas/ilustrações/fotos, não emojis.
- Voz, volume, velocidade e fala ao toque são configuráveis por paciente.
- Nunca expor `service_role` no navegador.
- Todas as tabelas expostas usam RLS.
- Não concentrar a implementação dentro de `app.js`.

---

### Task 1: Entitlement Pro e modelo CAA

**Files:**
- Create: `supabase/fonely-caa-v1.sql`
- Test: consultas SQL de verificação

**Interfaces:**
- Consumes: `public.patients.id`, `public.patients.user_id`, `public.account_access.user_id`
- Produces: `caa_profiles`, `caa_categories`, `caa_cards`, `caa_board_items`, `caa_board_versions`, `caa_usage_events`, `caa_phrase_sessions`

- [ ] Criar as tabelas CAA com FKs para paciente e usuário.
- [ ] Adicionar `plan_tier text not null default 'base'` em `account_access` com check `base|pro`.
- [ ] Habilitar RLS em todas as tabelas CAA.
- [ ] Criar policies para que o profissional só acesse registros cujo `user_id = auth.uid()`.
- [ ] Criar índice único para um perfil CAA por paciente.
- [ ] Criar `public_token` aleatório e único.
- [ ] Criar função segura de leitura pública da prancha publicada por token, retornando somente dados necessários ao comunicador.
- [ ] Criar função segura de gravação de evento público por token, validando perfil ativo.
- [ ] Executar advisors de segurança e corrigir alertas relacionados ao CAA.
- [ ] Verificar com SQL que uma conta `base` não pode criar CAA e uma conta `pro` pode.

### Task 2: Integração do CAA no prontuário

**Files:**
- Create: `fonely-caa.js`
- Create: `fonely-caa.css`
- Modify: `index.html`
- Modify: `app.js`

**Interfaces:**
- Consumes: paciente selecionado e estado atual do Fonely.
- Produces: ação `Ativar Fonely CAA`, card `Fonely CAA`, tela principal CAA.

- [ ] Incluir CSS/JS do CAA no `index.html`.
- [ ] Adicionar ponto de extensão no prontuário sem duplicar cadastro de paciente.
- [ ] Mostrar `Ativar Fonely CAA` somente para paciente sem perfil CAA.
- [ ] Mostrar estado bloqueado `Disponível no Fonely Pro` para plano base.
- [ ] Criar ativação somente quando entitlement Pro estiver ativo.
- [ ] Exibir card CAA após ativação.
- [ ] Mostrar item CAA no menu somente quando houver ao menos um paciente CAA ativo.
- [ ] Garantir que pacientes sem CAA mantenham o prontuário atual inalterado.

### Task 3: Biblioteca e editor de prancha

**Files:**
- Create: `fonely-caa-library.js`
- Modify: `fonely-caa.js`
- Modify: `fonely-caa.css`

**Interfaces:**
- Produces: biblioteca filtrável, seleção por paciente, editor e preview.

- [ ] Criar categorias iniciais.
- [ ] Criar cartões iniciais com ilustrações/pictogramas próprios em SVG simples e licenciáveis pelo próprio projeto.
- [ ] Permitir selecionar/desselecionar cartões por paciente.
- [ ] Permitir reordenar cartões e categorias.
- [ ] Permitir cartões fixos.
- [ ] Permitir criar cartão personalizado com imagem/foto enviada e texto falado.
- [ ] Permitir salvar rascunho.
- [ ] Permitir preview antes de publicar.
- [ ] Publicar cria snapshot imutável em `caa_board_versions`.

### Task 4: Voz, volume e montagem de frases

**Files:**
- Create: `fonely-caa-speech.js`
- Modify: `fonely-caa.js`
- Modify: `fonely-caa.css`

**Interfaces:**
- Produces: `FonelyCAA.speak(text, settings)`, `FonelyCAA.listVoices()`, barra de frase.

- [ ] Listar vozes disponíveis do navegador.
- [ ] Configurar volume 0–100%.
- [ ] Configurar velocidade de fala.
- [ ] Configurar voz por paciente.
- [ ] Implementar `falar ao tocar`.
- [ ] Implementar barra de frase.
- [ ] Implementar apagar último item e limpar.
- [ ] Implementar botão `Falar` para frase completa.
- [ ] Usar áudio gravado quando existir e fallback para síntese.
- [ ] Persistir configurações por paciente.

### Task 5: Comunicador público

**Files:**
- Create: `caa.html`
- Create: `caa-public.js`
- Create: `caa-public.css`

**Interfaces:**
- Consumes: token da URL.
- Produces: comunicador público isolado do painel profissional.

- [ ] Ler token sem expor `patientId`.
- [ ] Carregar somente a versão publicada.
- [ ] Não carregar prontuário, agenda, financeiro ou navegação profissional.
- [ ] Renderizar categorias e cartões responsivos.
- [ ] Reproduzir voz/áudio e montar frases.
- [ ] Registrar toques e frases por token.
- [ ] Bloquear acesso quando perfil CAA estiver desativado.
- [ ] Exibir mensagem clara para link inválido/desativado.

### Task 6: Histórico e uso

**Files:**
- Modify: `fonely-caa.js`
- Modify: `fonely-caa.css`

**Interfaces:**
- Consumes: `caa_board_versions`, `caa_usage_events`, `caa_phrase_sessions`
- Produces: abas Histórico e Uso.

- [ ] Mostrar versões com data/hora e resumo.
- [ ] Mostrar palavras mais usadas.
- [ ] Mostrar frases faladas.
- [ ] Mostrar contagem diária de interações.
- [ ] Mostrar categorias mais usadas.
- [ ] Permitir consultar dias anteriores.
- [ ] Garantir que dados de um paciente nunca apareçam em outro.

### Task 7: Compartilhar, desativar e regressão

**Files:**
- Modify: `fonely-caa.js`
- Modify: `fonely-caa.css`
- Modify: `README.md`

**Interfaces:**
- Produces: copiar link, abrir preview, desativar/reativar.

- [ ] Criar área Compartilhar com link único.
- [ ] Copiar link para área de transferência.
- [ ] Desativar sem excluir dados.
- [ ] Reativar recuperando prancha/histórico.
- [ ] Validar downgrade Pro -> base sem apagar dados.
- [ ] Validar que edição/ativação ficam bloqueadas no base.
- [ ] Rodar verificação manual de regressão das telas existentes.
- [ ] Atualizar README com Fonely CAA e plano Pro.
