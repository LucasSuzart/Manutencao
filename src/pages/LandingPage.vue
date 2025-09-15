<template>
  <div class="landing">
    <header class="hero">
      <div class="container">
        <div class="hero__logo">
          <img
            src="https://ecalc.com.br/wp-content/uploads/2024/06/ecalc-novo-ajustado-gd.png"
            alt="Ecalc Logo"
            class="logo"
          />
        </div>
        <h1 class="hero__title">eMainPrint Manager</h1>
        <h2 class="hero__subtitle-main">Sistema de Gestão de Manutenção para Gráficas</h2>
        <p class="hero__subtitle">
          Desenvolvemos uma solução especializada para gestão de manutenção de
          equipamentos gráficos. Acompanhe o progresso e participe do nosso protótipo.
        </p>
        <div class="hero__actions">
          <router-link to="/ativos" class="btn btn-primary"
            >Ver Protótipo (Ativos)</router-link
          >
          <router-link to="/os" class="btn btn-outline"
            >Ver Protótipo (Ordens)</router-link
          >
          <a href="#inscricao" class="btn btn-ghost">Quero ser beta</a>
        </div>
      </div>
    </header>

    <section class="social-proof container" aria-label="Depoimentos e validação">
      <div class="badge">Protótipo aberto</div>
      <p class="muted">
        Convite para early adopters — receba atualizações e ajude a priorizar
        funcionalidades.
      </p>
    </section>

    <section class="features container" aria-label="Principais recursos">
      <article class="feature">
        <h3>Impressoras & Equipamentos</h3>
        <p>
          Cadastre impressoras offset, dobradeiras, guilhotinas e CTPs com fotos e dados
          técnicos detalhados.
        </p>
      </article>
      <article class="feature">
        <h3>Manutenção Preventiva</h3>
        <p>
          Agende e rastreie manutenções preventivas para evitar paradas inesperadas na
          produção.
        </p>
      </article>
      <article class="feature">
        <h3>KPIs Gráficos</h3>
        <p>
          Métricas específicas como MTTR para reparos e MTBF para confiabilidade de
          equipamentos.
        </p>
      </article>
      <article class="feature">
        <h3>App Mobile</h3>
        <p>
          App nativo para técnicos verificarem OS abertas, cronometrar tempo de manutenção
          e registrar fotos em campo.
        </p>
      </article>
      <article class="feature">
        <h3>Controle de Tempo</h3>
        <p>
          Sincronização automática do tempo de execução para gerar KPIs precisos de MTTR e
          produtividade.
        </p>
      </article>
      <article class="feature">
        <h3>Gestão Completa</h3>
        <p>
          Histórico detalhado, fotos antes/depois, peças utilizadas e relatórios para
          gestão estratégica.
        </p>
      </article>
    </section>

    <section class="demo container" aria-label="Veja em ação">
      <h2>Equipamentos Gráficos Suportados</h2>
      <p class="muted">
        Gestão especializada para máquinas do setor gráfico e de impressão
      </p>
      <div class="screenshots">
        <div class="screenshot">
          <img
            src="/machinas/graficas/dobradeira-stahl-T-52.jpg"
            alt="Dobradeira Stahl T-52"
          />
          <p>Dobradeira Stahl T-52</p>
        </div>
        <div class="screenshot">
          <img
            src="https://www.heidelberg.com/global/media/global_media/products___sheetfed_offset/2020_20/cx_92/cx92-narrow.jpg"
            alt="Impressora Offset Heidelberg"
          />
          <p>Impressora Offset Heidelberg</p>
        </div>
        <div class="screenshot">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7Vk4YztiwYB_eCJnTqGgoqvhojRcZexkg9g&s"
            alt="CTP Heidelberg Suprasetter"
          />
          <p>CTP Heidelberg Suprasetter</p>
        </div>
        <div class="screenshot">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu9x922OOridBwJnUF-KFJUroRDG-H72QLuw&s"
            alt="Guilhotina Polar"
          />
          <p>Guilhotina Industrial Polar</p>
        </div>
      </div>
    </section>

    <section class="mobile-app container" aria-label="App Mobile para Técnicos">
      <h2>App Mobile para Técnicos e Gestores</h2>
      <p class="muted">
        Aplicativo nativo desenvolvido para técnicos de manutenção, com suporte a uso
        offline e sincronização automática. Permite registrar fotos, relatórios e
        atualizações diretamente do campo, além de acompanhar em tempo real as ordens de
        serviço atribuídas. Gestores também podem monitorar o andamento das atividades e a
        produtividade da equipe de qualquer lugar.
      </p>

      <div class="mobile-showcase">
        <div class="mobile-gallery">
          <div class="mobile-carousel">
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.14.jpeg"
              alt="Tela principal do app mobile"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.28.jpeg"
              alt="Lista de ordens de serviço"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.40.jpeg"
              alt="Cronômetro de tempo de manutenção"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.29.10.jpeg"
              alt="Detalhes da ordem de serviço"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.29.25.jpeg"
              alt="Registro de fotos e relatórios"
            />
            <!-- Duplicação para loop infinito -->
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.14.jpeg"
              alt="Tela principal do app mobile"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.28.jpeg"
              alt="Lista de ordens de serviço"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.28.40.jpeg"
              alt="Cronômetro de tempo de manutenção"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.29.10.jpeg"
              alt="Detalhes da ordem de serviço"
            />
            <img
              src="/mobile/WhatsApp Image 2025-09-11 at 23.29.25.jpeg"
              alt="Registro de fotos e relatórios"
            />
          </div>
        </div>

        <div class="mobile-features">
          <div class="mobile-feature">
            <h4>⏱️ Cronômetro Integrado</h4>
            <p>Registre automaticamente o tempo de cada manutenção para KPIs precisos</p>
          </div>
          <div class="mobile-feature">
            <h4>📱 Funcionamento Offline</h4>
            <p>Trabalhe sem internet e sincronize quando conectar</p>
          </div>
          <div class="mobile-feature">
            <h4>📸 Fotos Antes/Depois</h4>
            <p>Documente visualmente o progresso das manutenções</p>
          </div>
          <div class="mobile-feature">
            <h4>🔄 Sincronização Automática</h4>
            <p>Dados atualizados em tempo real entre web e mobile</p>
          </div>
        </div>
      </div>
    </section>

    <section class="now container" aria-label="O que estamos prototipando agora">
      <h2>Funcionalidades em Desenvolvimento</h2>
      <ul class="checklist">
        <li>App mobile para técnicos com cronômetro de tempo de manutenção</li>
        <li>Cadastro de máquinas gráficas com fotografias antes/depois</li>
        <li>Sincronização automática de dados para KPIs precisos</li>
        <li>Ordens de serviço com histórico detalhado e peças utilizadas</li>
        <li>Dashboard executivo com métricas de produtividade</li>
        <li>Funcionamento offline com sincronização inteligente</li>
      </ul>
      <p class="muted">
        Quer influenciar nas próximas funcionalidades? Inscreva-se abaixo.
      </p>
    </section>

    <section
      id="inscricao"
      class="cta container"
      aria-label="Inscrição para acesso antecipado"
    >
      <div class="card">
        <h2>Participe do Beta</h2>
        <p>
          Fale conosco no WhatsApp e receba acesso antecipado ao sistema de gestão de
          manutenção.
        </p>

        <div class="whatsapp-only">
          <a
            href="https://wa.me/5511973988020?text=Quero%20participar%20do%20Beta%20do%20CMMS%20da%20Ecalc"
            target="_blank"
            class="btn btn-primary btn-large"
          >
            💬 Falar no WhatsApp
          </a>
          <p class="whatsapp-info">
            Clique para abrir o WhatsApp e conversar diretamente com nossa equipe sobre o
            acesso beta.
          </p>
        </div>
      </div>
    </section>

    <section class="faq container" aria-label="Perguntas frequentes">
      <h2>Perguntas Frequentes</h2>
      <details>
        <summary>Quando estará disponível para uso?</summary>
        <p>
          Estamos refinando o protótipo com feedback de gráficas parceiras. A versão beta
          estará disponível no primeiro trimestre de 2025.
        </p>
      </details>
      <details>
        <summary>O beta é gratuito?</summary>
        <p>
          Sim, participantes do beta terão acesso gratuito durante todo o período de
          testes e desenvolvimento.
        </p>
      </details>
      <details>
        <summary>Funciona sem internet?</summary>
        <p>
          Sim, o MainPrint Manager opera offline e sincroniza automaticamente quando a
          conexão estiver disponível.
        </p>
      </details>
      <details>
        <summary>Atende apenas gráficas?</summary>
        <p>
          Inicialmente focamos em gráficas, mas o sistema pode ser adaptado para outros
          setores industriais.
        </p>
      </details>
    </section>

    <footer class="landing__footer">
      <div class="container">
        © {{ new Date().getFullYear() }} — MainPrint Manager •
        <a href="#" class="link">Política de Privacidade</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const name = ref("");
const company = ref("");
const role = ref("");
const consent = ref(false);

const emailError = ref<string | null>(null);
const submitted = ref(false);
const submitError = ref<string | null>(null);
const submitting = ref(false);

function validate() {
  emailError.value = null;
  submitError.value = null;

  const emailVal = email.value.trim();
  if (!emailVal) {
    emailError.value = "Informe um e-mail.";
  } else if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
    emailError.value = "E-mail inválido.";
  }

  if (!consent.value) {
    submitError.value = "É necessário aceitar o consentimento para contato.";
  }

  return !emailError.value && !submitError.value;
}

// Placeholder de envio: integre com seu backend (ex.: API, Formspree, Supabase)
async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    // Exemplo: await fetch('/api/interesse', { method: 'POST', body: JSON.stringify({ email: email.value, name: name.value, company: company.value, role: role.value }) })
    await new Promise((r) => setTimeout(r, 800)); // simula requisição
    submitted.value = true;
    // Limpa campos (exceto e-mail, se preferir manter)
    name.value = "";
    company.value = "";
    role.value = "";
  } catch (e) {
    submitError.value = "Não foi possível enviar agora. Tente novamente mais tarde.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.landing {
  color: var(--color-text);
  background: var(--color-background);
}

.hero {
  padding: 4rem 0 3rem;
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #fed7aa 100%);
  color: #1f2937;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #fdba74;
}

.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.hero > .container {
  position: relative;
  z-index: 2;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero__logo {
  margin-bottom: 1rem;
}

.logo {
  max-width: 200px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.hero__title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-shadow: none;
  background: linear-gradient(135deg, #f78018 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__subtitle-main {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  opacity: 0.9;
  color: #374151;
  text-shadow: none;
}

.hero__subtitle {
  opacity: 0.85;
  margin-bottom: 2rem;
  max-width: 65ch;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4b5563;
  text-shadow: none;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: linear-gradient(45deg, #f78018, #e6700d);
  color: white;
  box-shadow: 0 4px 15px rgba(247, 128, 24, 0.4);
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(247, 128, 24, 0.5);
}

.btn-secondary {
  background: rgba(247, 128, 24, 0.1);
  border: 2px solid #f78018;
  color: #f78018;
  backdrop-filter: blur(10px);
}
.btn-secondary:hover {
  background: #f78018;
  color: white;
  transform: translateY(-2px);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  backdrop-filter: blur(10px);
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.social-proof {
  text-align: center;
  margin: 2rem auto;
  padding: 0 1rem;
}
.badge {
  display: inline-block;
  background: linear-gradient(45deg, #10b981, #06b6d4);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.muted {
  opacity: 0.8;
  margin-top: 0.75rem;
  color: var(--color-text-secondary);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 4rem auto;
  padding: 0 1rem;
}
.feature {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--color-accent);
}

.feature h3 {
  color: var(--color-accent);
  margin-bottom: 0.75rem;
}

.now,
.demo,
.cta,
.faq {
  margin: 4rem auto;
  padding: 0 1rem;
}

.now h2,
.faq h2,
.demo h2 {
  margin-bottom: 1.25rem;
  font-size: 2rem;
  color: var(--color-text);
}

.checklist {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  max-width: 600px;
}
.checklist li {
  padding-left: 2rem;
  position: relative;
  line-height: 1.6;
}
.checklist li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 900;
  font-size: 1.25rem;
}

.screenshots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.screenshot {
  text-align: center;
}
.screenshot img {
  width: 100%;
  max-width: 300px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.screenshot img:hover {
  transform: scale(1.05);
}

.mobile-app {
  background: linear-gradient(135deg, #fef7ed 0%, #fff7ed 100%);
  padding: 4rem 2rem;
  margin: 4rem 0;
  border-radius: 1.5rem;
  border: 1px solid #fed7aa;
}

.mobile-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-top: 2rem;
}

.mobile-gallery {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 8px 25px rgba(247, 128, 24, 0.15);
}

.mobile-carousel {
  display: flex;
  gap: 1rem;
  animation: carousel 30s infinite linear;
  width: max-content;
}

.mobile-carousel img {
  width: 200px;
  height: 400px;
  object-fit: cover;
  border-radius: 1rem;
  border: 2px solid #f78018;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.mobile-carousel img:hover {
  transform: scale(1.05);
  animation-play-state: paused;
}

@keyframes carousel {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.mobile-features {
  display: grid;
  gap: 1.5rem;
}

.mobile-feature {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border-left: 4px solid #f78018;
  transition: transform 0.3s ease;
}

.mobile-feature:hover {
  transform: translateX(8px);
}

.mobile-feature h4 {
  color: #f78018;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.mobile-feature p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .mobile-showcase {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .mobile-carousel img {
    width: 150px;
    height: 300px;
  }

  .mobile-app {
    padding: 2rem 1rem;
    margin: 2rem 0;
  }
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 2rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.form {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
}
.form__row {
  display: grid;
  gap: 0.5rem;
}
.form__row--inline {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.checkbox {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  cursor: pointer;
}
input,
select {
  background: var(--color-background);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  outline: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}
input:focus,
select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.faq details {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
  margin-top: 1rem;
  transition: all 0.2s ease;
}
.faq details:hover {
  background: var(--color-background);
  transform: translateY(-1px);
}
.faq summary {
  cursor: pointer;
  font-weight: 600;
  margin: -0.25rem 0;
  padding: 0.25rem 0;
  color: var(--color-text);
}

.landing__footer {
  padding: 3rem 0;
  text-align: center;
  opacity: 0.8;
  border-top: 1px solid var(--color-border);
  margin-top: 4rem;
  background: var(--color-surface);
}

.error {
  color: #dc2626;
  font-weight: 500;
}
.success {
  color: #059669;
  font-weight: 500;
}
.privacy {
  font-size: 0.9rem;
  opacity: 0.8;
}

.btn-whatsapp {
  background: linear-gradient(45deg, #25d366, #128c7e);
  color: white;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-whatsapp:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
}

.whatsapp-info {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 0 1.5rem;
  }
  .hero__title {
    font-size: 2rem;
  }
  .hero__subtitle-main {
    font-size: 1.1rem;
  }
  .logo {
    max-width: 150px;
  }
  .hero__actions {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .btn {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
  .features {
    grid-template-columns: 1fr;
  }
  .card {
    padding: 1.5rem;
  }
}
</style>
