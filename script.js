// COLE A URL DO SEU ENDPOINT N8N AQUI:
const API_URL = "https://SEU_N8N_DOMAIN/webhook/api/clientes";

const elCliente = document.querySelector("#cliente");
const elInicio  = document.querySelector("#dataInicio");
const elFim     = document.querySelector("#dataFim");
const elSaida   = document.querySelector("#saida");

document.querySelector("#btnGerar").addEventListener("click", gerar);
document.querySelector("#btnCopiar").addEventListener("click", copiar);

setDefaults();
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
  elCliente.innerHTML = `<option>Carregando...</option>`;

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error("API ok=false");

    const clientes = data.clientes || [];
    elCliente.innerHTML =
      `<option value="">Selecione</option>` +
      clientes.map(c => `
        <option value="${esc(c.nome)}">${esc(c.nome)}</option>
      `).join("");

  } catch (e) {
    console.error(e);
    elCliente.innerHTML = `<option>Erro ao carregar</option>`;
  }
}

function gerar() {
  const nome = elCliente.value;
  if (!nome) return elSaida.value = "Selecione um cliente.";

  const ini = elInicio.value ? br(elInicio.value) : "";
  const fim = elFim.value ? br(elFim.value) : "";

  // comando padrão pro WhatsApp (fácil de parsear no n8n)
  elSaida.value = `/relatório cliente="${nome}" inicio=${ini} fim=${fim}`;
}

async function copiar() {
  try {
    await navigator.clipboard.writeText(elSaida.value);
  } catch (e) {
    elSaida.select();
    document.execCommand("copy");
  }
}

function br(iso){ // yyyy-mm-dd -> dd/mm/yyyy
  const [y,m,d] = iso.split("-");
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
