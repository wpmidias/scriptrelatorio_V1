// ===============================
// GERADOR DE SCRIPT (WP Mídias)
// Formato final do comando:
// /relatório NOME_DO_CLIENTE DD/MM/AAAA DD/MM/AAAA
// ===============================

// ✅ SUA API DO N8N (já funcionando)
const API_URL = "https://n8n.wpmidias.space/webhook/api/clientes";

const elCliente = document.querySelector("#cliente");
const elInicio  = document.querySelector("#dataInicio");
const elFim     = document.querySelector("#dataFim");
const elSaida   = document.querySelector("#saida");

document.querySelector("#btnGerar").addEventListener("click", gerar);
document.querySelector("#btnCopiar").addEventListener("click", copiar);

// Defaults: últimos 7 dias
setDefaults();

// Carrega clientes ao abrir
carregarClientes();

function setDefaults(){
  const hoje = new Date();
  const fim = new Date(hoje);
  const ini = new Date(hoje);
  ini.setDate(ini.getDate() - 7);

  elFim.value = toISO(fim);
  elInicio.value = toISO(ini);
}

async function carregarClientes() {
  elCliente.innerHTML = `<option value="">Carregando...</option>`;
  elCliente.disabled = true;

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data || data.ok !== true) throw new Error("API ok != true");

    const clientes = Array.isArray(data.clientes) ? data.clientes : [];

    const nomes = clientes
      .map(c => (c && c.nome ? String(c.nome).trim() : ""))
      .filter(Boolean)
      .sort((a,b) => a.localeCompare(b, "pt-BR"));

    if (!nomes.length) throw new Error("Lista vazia");

    elCliente.innerHTML =
      `<option value="">Selecione</option>` +
      nomes.map(nome => `<option value="${esc(nome)}">${esc(nome)}</option>`).join("");

    elCliente.disabled = false;

  } catch (e) {
    console.error("Falha ao carregar clientes:", e);
    elCliente.innerHTML = `<option value="">Erro ao carregar</option>`;
    elCliente.disabled = false;
    elSaida.value = "Erro ao carregar clientes. Verifique a API_URL e se a API retorna JSON ok:true.";
  }
}

function gerar() {
  const nome = (elCliente.value || "").trim();
  if (!nome) {
    elSaida.value = "Selecione um cliente.";
    return;
  }

  const iniIso = elInicio.value;
  const fimIso = elFim.value;

  if (!iniIso || !fimIso) {
    elSaida.value = "Selecione Data Início e Data Fim.";
    return;
  }

  const ini = br(iniIso);
  const fim = br(fimIso);

  // ✅ FORMATO EXATO QUE VOCÊ QUER:
  // /relatório Alle Apple 15/02/2026 18/02/2026
  elSaida.value = `/relatório ${nome} ${ini} ${fim}`.trim();
}

async function copiar() {
  const texto = (elSaida.value || "").trim();
  if (!texto) return;

  try {
    await navigator.clipboard.writeText(texto);
  } catch (e) {
    elSaida.focus();
    elSaida.select();
    document.execCommand("copy");
  }
}

// yyyy-mm-dd -> dd/mm/yyyy
function br(iso){
  const [y,m,d] = String(iso).split("-");
  return `${d}/${m}/${y}`;
}

function toISO(dt){
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,"0");
  const d = String(dt.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function esc(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
