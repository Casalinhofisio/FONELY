# Fonely CAA — Design do módulo

Data: 2026-09-18
Status: aprovado em conceito; aguardando revisão final antes da implementação
Branch: feat/fonely-caa

## 1. Objetivo

Adicionar ao Fonely um módulo opcional de Comunicação Aumentativa e Alternativa (CAA), vinculado aos pacientes já cadastrados no sistema.

O Fonely CAA não será obrigatório e não aparecerá como recurso ativo para todos os pacientes. Cada paciente só terá CAA quando o profissional ativar explicitamente o módulo no prontuário.

## 2. Regras principais

- O paciente continua tendo um único cadastro no Fonely.
- O CAA usa o mesmo patientId do prontuário existente.
- O profissional ativa o Fonely CAA individualmente por paciente.
- Antes da ativação, o paciente não possui prancha, link público, histórico ou registros de uso.
- Após a ativação, o paciente passa a ter:
  - prancha de comunicação;
  - biblioteca selecionável;
  - histórico de versões;
  - histórico de uso;
  - link exclusivo de acesso;
  - configurações próprias de áudio e visual.
- Desativar o CAA não apaga os dados. Apenas interrompe o acesso público e oculta o módulo até eventual reativação.

## 3. Planos e acesso

O Fonely terá dois planos comerciais. O Fonely CAA será um recurso exclusivo do plano Pro, que será o plano com acesso completo aos recursos avançados.

Regras de acesso:
- somente contas no plano Pro podem ativar Fonely CAA para um paciente;
- o plano não-Pro não pode criar, editar, publicar ou compartilhar pranchas CAA;
- no plano não-Pro, o recurso pode aparecer de forma bloqueada com indicação de que está disponível no Pro;
- pacientes que já possuem CAA ativo continuam vinculados ao profissional e à sua conta;
- se uma conta Pro perder o entitlement do Pro, nenhuma prancha ou histórico será apagado;
- em caso de downgrade, edição e novas ativações ficam bloqueadas até a reativação do Pro;
- o comportamento do link público após downgrade deverá ser controlado por regra de produto configurável, sem exclusão de dados;
- a permissão deve ser validada no backend e não apenas escondida na interface;
- o sistema deverá usar uma feature/entitlement como `caa_enabled` ou equivalente para liberar o módulo;
- o nome e preço do plano não-Pro poderão ser definidos futuramente sem alterar a lógica do CAA.

### Experiência no plano não-Pro

Quando o profissional tentar acessar o Fonely CAA:
- mostrar uma apresentação curta do recurso;
- informar que o CAA está incluído no plano Pro;
- oferecer ação para conhecer/assinar o Pro quando a área de pagamentos estiver implementada;
- não criar registros CAA no banco antes da confirmação do entitlement.

### Experiência no Pro

O profissional Pro pode:
- ativar CAA por paciente;
- criar e editar pranchas;
- usar biblioteca e cartões personalizados;
- publicar e atualizar;
- gerar link exclusivo;
- acompanhar histórico e uso;
- desativar e reativar sem perda de dados.

## 4. Entrada no Fonely

### No prontuário do paciente

Quando o CAA ainda não estiver ativo:
- mostrar ação "Ativar Fonely CAA";
- explicar em uma linha que será criada uma prancha de comunicação vinculada àquele paciente.

Depois da ativação:
- substituir a ação por um card "Fonely CAA";
- exibir resumo da prancha, última atualização e acesso rápido às áreas do módulo.

### No menu principal

- O item "CAA" só aparece para o profissional quando existir pelo menos um paciente com CAA ativo.
- A tela CAA lista apenas pacientes com o módulo ativo.
- Pacientes sem CAA continuam aparecendo apenas nas áreas normais do Fonely.

## 5. Área profissional do CAA

Ao abrir um paciente com CAA ativo, o profissional terá as abas:

1. Prancha
2. Biblioteca
3. Personalizar
4. Histórico
5. Uso
6. Compartilhar

### Prancha

Permite montar e reorganizar a prancha que o paciente utilizará.

Funções:
- adicionar e remover cartões;
- reordenar cartões;
- reordenar categorias;
- escolher cartões fixos;
- definir tamanho dos cartões;
- definir quantidade de colunas;
- visualizar a prancha antes de publicar;
- salvar rascunho;
- publicar atualização.

### Biblioteca

Biblioteca geral do Fonely CAA com cartões prontos, organizados por categorias.

Categorias iniciais:
- pessoas;
- pronomes;
- ações;
- necessidades;
- alimentação;
- bebidas;
- higiene;
- banheiro;
- corpo;
- dor;
- emoções;
- lugares;
- escola;
- brinquedos;
- lazer;
- animais;
- roupas;
- objetos;
- tempo;
- cores;
- números;
- respostas sociais;
- sim e não;
- perguntas;
- conectivos e palavras para formação de frases.

Cada cartão poderá ter:
- imagem;
- palavra ou expressão;
- texto falado;
- categoria;
- posição;
- áudio padrão;
- opção de áudio personalizado.

O profissional escolhe quais itens da biblioteca serão usados por cada paciente.

### Criar cartão personalizado

O profissional poderá:
- enviar uma foto;
- escolher uma imagem disponível;
- escrever palavra ou frase;
- definir o texto falado;
- usar voz automática;
- gravar áudio próprio;
- escolher categoria;
- deixar o cartão fixo ou dentro de uma categoria.

## 6. Prancha do paciente

O link do paciente abre somente o comunicador.

A tela não mostra:
- prontuário;
- agenda;
- financeiro;
- outros pacientes;
- painel profissional;
- botões de edição.

Estrutura principal:

- barra de frase no topo;
- botão Falar;
- botão apagar último item;
- botão limpar;
- categorias;
- grade de cartões.

Cada cartão contém:
- imagem grande;
- palavra ou expressão abaixo;
- resposta visual ao toque.

Configuração por paciente:
- falar a palavra imediatamente ao tocar: ligado/desligado;
- adicionar cartão à barra de frase: ligado/desligado;
- falar frase completa pelo botão Falar;
- tamanho dos cartões;
- número de colunas;
- ordem das categorias;
- cartões fixos;
- volume/voz conforme disponibilidade do dispositivo.

Exemplo:
EU + QUERO + ÁGUA -> botão Falar -> "Eu quero água."

## 7. Link exclusivo

Cada paciente ativo recebe um identificador público aleatório e não previsível.

Exemplo conceitual:
fonely.com.br/caa/<token-do-paciente>

Regras:
- o link continua o mesmo após atualizações da prancha;
- abrir o link mostra apenas a prancha publicada;
- alterações em rascunho não aparecem ao paciente;
- ao publicar uma nova versão, o link passa a mostrar a nova prancha;
- se o CAA for desativado, o link deixa de exibir a prancha;
- PIN opcional poderá ser habilitado pelo profissional.

Nunca usar patientId sequencial ou informação pessoal no link público.

## 8. Sincronização

A prancha publicada será armazenada no Supabase.

Fluxo:
1. profissional edita;
2. alterações ficam em rascunho;
3. profissional publica;
4. uma nova versão é criada;
5. o paciente passa a receber a versão atualizada pelo mesmo link;
6. a versão anterior permanece salva no histórico.

A sincronização não dependerá do localStorage do navegador.

## 9. Histórico de versões

Cada publicação cria um registro imutável contendo:
- data e hora;
- profissional responsável;
- versão;
- cartões adicionados;
- cartões removidos;
- cartões alterados;
- mudanças de ordem;
- mudanças de configurações;
- snapshot da prancha publicada.

O profissional poderá visualizar versões anteriores.

Restaurar uma versão antiga não apaga o histórico; cria uma nova versão baseada nela.

## 10. Histórico de uso

Registrar por paciente:
- data e hora do uso;
- cartão utilizado;
- categoria;
- frase montada;
- quantidade de toques;
- sequência dos cartões;
- uso do botão Falar.

A tela "Uso" apresentará:
- total de interações por dia;
- palavras mais utilizadas;
- categorias mais utilizadas;
- frases montadas;
- palavras diferentes utilizadas;
- calendário para consultar dias anteriores.

O registro de uso não será tratado como interpretação clínica automática. O sistema apresenta dados; a análise pertence ao profissional.

## 11. Estrutura de dados proposta

Tabelas conceituais:

### caa_profiles
- id
- patient_id
- professional_id
- enabled
- public_token
- pin_enabled
- pin_hash
- speech_mode
- columns
- card_size
- created_at
- updated_at

### caa_cards
Biblioteca padrão e cartões personalizados.
- id
- owner_id opcional
- category_id
- label
- speech_text
- image_url
- audio_url
- is_system
- active

### caa_categories
- id
- owner_id opcional
- name
- icon
- position

### caa_board_items
Itens selecionados para a prancha atual.
- id
- caa_profile_id
- card_id
- category_id
- position
- pinned
- visible

### caa_board_versions
- id
- caa_profile_id
- version_number
- snapshot
- change_summary
- published_by
- published_at

### caa_usage_events
- id
- caa_profile_id
- card_id opcional
- event_type
- phrase_session_id
- metadata
- created_at

### caa_phrase_sessions
- id
- caa_profile_id
- phrase_text
- card_sequence
- spoken
- created_at

## 12. Segurança

- Todas as tabelas clínicas e administrativas usarão RLS.
- Um profissional autenticado só poderá acessar pacientes vinculados à própria conta.
- O link público nunca concede acesso direto às tabelas administrativas.
- O acesso público será resolvido por token específico da prancha publicada.
- Nenhuma chave service_role ficará no navegador.
- Imagens e áudios personalizados terão regras de acesso próprias.
- Alterações de prancha exigem usuário profissional autenticado.
- O paciente pelo link público não pode editar a prancha.

## 13. Áudio

Primeira versão:
- síntese de voz do navegador/dispositivo para palavras e frases;
- opção de tocar áudio gravado quando existir;
- botão Falar reproduz a frase montada.

Prioridade:
1. áudio personalizado do cartão, se houver e se o modo permitir;
2. texto falado configurado;
3. rótulo visual como fallback.

## 14. Estados do módulo

Por paciente:

### Não ativado
Sem dados de CAA e sem link.

### Ativo em configuração
Perfil criado, mas ainda sem versão publicada.

### Publicado
Prancha disponível pelo link.

### Desativado
Dados preservados e link temporariamente indisponível.

## 15. Fluxo principal do profissional

Paciente -> Ativar Fonely CAA -> escolher cartões -> organizar prancha -> testar -> publicar -> copiar link.

Depois:
Paciente -> Fonely CAA -> editar -> publicar nova versão -> mesma URL recebe atualização.

## 16. Fluxo principal do paciente

Abrir link -> escolher categoria/cartão -> ouvir palavra -> montar frase -> tocar Falar.

Sem necessidade de conta profissional e sem acesso ao restante do Fonely.

## 17. Escopo da primeira versão

Incluir:
- ativação por paciente;
- tela CAA no prontuário;
- listagem de pacientes CAA;
- biblioteca;
- seleção de cartões;
- cartões personalizados;
- imagens;
- voz automática;
- áudio personalizado;
- montagem de frases;
- publicação;
- link exclusivo;
- histórico de versões;
- histórico básico de uso;
- desativação sem perda de dados.

Fora da primeira versão:
- IA para sugerir vocabulário;
- interpretação clínica automática;
- marketplace de pranchas;
- comunicação entre profissionais;
- prescrição automática;
- gamificação complexa.

## 18. Critérios de sucesso

A primeira versão estará funcional quando:

0. uma conta sem plano Pro não conseguir ativar ou administrar o CAA, enquanto uma conta Pro conseguir;

1. um profissional puder ativar o CAA para um paciente já existente;
2. outro paciente sem CAA permanecer totalmente inalterado;
3. o profissional puder montar uma prancha usando cartões prontos;
4. puder adicionar um cartão personalizado;
5. puder publicar a prancha;
6. o link público abrir somente a prancha correta;
7. tocar num cartão produzir fala;
8. for possível montar e falar uma frase;
9. publicar uma alteração atualizar o mesmo link;
10. a versão anterior continuar disponível no histórico;
11. o uso do paciente gerar eventos vinculados somente àquele paciente;
12. desativar o módulo bloquear o link sem apagar o histórico.

## 19. Integração com o Fonely atual

O módulo deverá seguir a identidade visual existente do Fonely e reutilizar:
- patientId;
- autenticação do profissional;
- navegação;
- componentes visuais quando apropriado.

O comunicador público terá interface própria, simplificada e adequada ao uso em celular e tablet.

A implementação deve evitar concentrar todo o CAA dentro do arquivo app.js atual. O módulo deverá ser separado em arquivos/componentes próprios para manter o código sustentável.
