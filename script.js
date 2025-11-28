// --- MOCK DATA POUR LE BOARD (remplaçable par une API backend plus tard) ---

const ASSETS = [
  {
    id: "sp500",
    name: "S&P 500",
    label: "Large cap US",
    ticker: "^GSPC",
    value: 5098.42,
    change: -0.27,
    type: "equity",
    tags: ["US", "Large cap", "Référence portefeuille"],
    comment:
      "Indice actions large US, souvent au cœur d’une poche ETF diversifiée.",
    series: [100, 99, 101, 102, 103, 101, 104, 105]
  },
  {
    id: "cac40",
    name: "CAC 40",
    label: "Actions France",
    ticker: "^FCHI",
    value: 7420.15,
    change: 0.32,
    type: "equity",
    tags: ["France", "Indice domestique"],
    comment:
      "Indice actions français, utile pour relier les annonces économiques locales au marché.",
    series: [95, 96, 94, 97, 98, 99, 100, 101]
  },
  {
    id: "msciworld",
    name: "MSCI World",
    label: "ETF monde développé",
    ticker: "URTH",
    value: 3220.7,
    change: 0.18,
    type: "equity",
    tags: ["Monde développé", "ETF coeur"],
    comment:
      "Indice monde développé, utilisé comme base de portefeuille long terme.",
    series: [90, 91, 92, 93, 94, 95, 96, 97]
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    label: "Crypto labo",
    ticker: "BTC",
    value: 68440,
    change: 1.25,
    type: "crypto",
    tags: ["Crypto", "Volatilité forte"],
    comment:
      "Suivi comme laboratoire de volatilité. Poids limité dans une poche risque.",
    series: [100, 103, 98, 105, 110, 108, 112, 115]
  },
  {
    id: "ethereum",
    name: "Ethereum",
    label: "Réseau / smart contracts",
    ticker: "ETH",
    value: 3905,
    change: -0.8,
    type: "crypto",
    tags: ["Crypto", "Smart contracts"],
    comment:
      "Actif lié à un réseau de contrats intelligents. Analyse centrée sur le risque et la technologie.",
    series: [95, 97, 96, 98, 97, 99, 101, 100]
  }
];

// --- HELPERS ---

function formatNumber(n) {
  if (n >= 1000) {
    return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  return n.toFixed(2);
}

function formatChange(pct) {
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

// --- BOARD & CHART ---

const marketsTableEl = document.getElementById("markets-table");
const chartTitleEl = document.getElementById("chart-title");
const chartTickerEl = document.getElementById("chart-ticker");
const chartCanvasEl = document.getElementById("chart-canvas");
const chartCommentEl = document.getElementById("chart-comment");
const chartTagsEl = document.getElementById("chart-tags");
const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "all";
let currentAssetId = null;

function renderTable() {
  marketsTableEl.innerHTML = "";

  ASSETS.filter((a) => currentFilter === "all" || a.type === currentFilter).forEach((asset) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "table-row";
    row.dataset.assetId = asset.id;

    row.innerHTML = `
      <div>
        <span class="table-name-main">${asset.name}</span>
        <span class="table-name-sub">${asset.label}</span>
      </div>
      <div class="table-value">${formatNumber(asset.value)}</div>
      <div class="table-change ${asset.change >= 0 ? "pos" : "neg"}">
        ${formatChange(asset.change)}
      </div>
    `;

    row.addEventListener("click", () => selectAsset(asset.id));
    marketsTableEl.appendChild(row);
  });
}

function renderChart(asset) {
  chartTitleEl.textContent = asset.name;
  chartTickerEl.textContent = asset.ticker;
  chartCommentEl.textContent = asset.comment;

  chartTagsEl.innerHTML = "";
  asset.tags.forEach((t) => {
    const tag = document.createElement("span");
    tag.className = "chart-tag";
    tag.textContent = t;
    chartTagsEl.appendChild(tag);
  });

  chartCanvasEl.innerHTML = "";
  const max = Math.max(...asset.series);
  asset.series.forEach((v) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const ratio = v / max;
    bar.style.transform = `scaleY(${Math.max(0.15, ratio)})`;
    chartCanvasEl.appendChild(bar);
  });
}

function selectAsset(id) {
  const asset = ASSETS.find((a) => a.id === id);
  if (!asset) return;
  currentAssetId = id;
  renderChart(asset);
}

// filtre boutons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter || "all";
    renderTable();
    // si l'actif courant n'est plus dans le filtre, on reset le chart
    if (currentAssetId) {
      const stillVisible = ASSETS.some(
        (a) => a.id === currentAssetId && (currentFilter === "all" || a.type === currentFilter)
      );
      if (!stillVisible) {
        chartTitleEl.textContent = "Sélectionne un actif";
        chartTickerEl.textContent = "";
        chartCommentEl.textContent =
          "Clique sur un actif du board pour voir une trajectoire pédagogique simulée.";
        chartCanvasEl.innerHTML = "";
        chartTagsEl.innerHTML = "";
        currentAssetId = null;
      }
    }
  });
});

// --- NAV SMOOTH SCROLL ---

document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll");
    const el = document.querySelector(target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = rect.top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

// --- CHAT DÉBUTANT ---

const chatLogEl = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

function addMessage(text, from = "bot") {
  const msg = document.createElement("div");
  msg.className = `chat-message ${from}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.innerHTML = text;
  msg.appendChild(bubble);
  chatLogEl.appendChild(msg);
  chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function answerForQuestion(q) {
  const txt = q.toLowerCase();

  if (txt.includes("livret") || txt.includes("pel")) {
    return `
      <strong>Lecture FEIS – Livret vs ETF :</strong><br/>
      • Le livret = poche de sécurité liquide, horizon très court, taux connu.<br/>
      • L’ETF actions = actif de marché, horizon long (10 ans et +), valeur qui varie.<br/>
      • On compare rarement les deux : on définit d’abord la poche sécurité, puis on réfléchit à la poche marché.`;
  }

  if (txt.includes("crypto")) {
    return `
      <strong>Lecture FEIS – Crypto :</strong><br/>
      • Classe d’actifs très volatile, non indispensable pour démarrer.<br/>
      • On la traite comme poche “labo” limitée (ex : quelques % du patrimoine investissable).<br/>
      • Avant la crypto : cash, livret, puis ETF diversifiés bien compris.`;
  }

  if (txt.includes("risque") || txt.includes("perdre")) {
    return `
      <strong>Lecture FEIS – Gérer le risque :</strong><br/>
      • On commence par définir ce que tu ne veux pas perdre (épargne de précaution).<br/>
      • Ensuite seulement, on décide ce qui peut être exposé aux marchés.<br/>
      • Outil clé : horizon de temps et pourcentage max acceptable de baisse temporaire.`;
  }

  if (txt.includes("horizon") || txt.includes("long terme") || txt.includes("court terme")) {
    return `
      <strong>Lecture FEIS – Horizon :</strong><br/>
      • Court terme (&lt; 3 ans) : on reste majoritairement hors marché, livret / cash.<br/>
      • Moyen terme (3–7 ans) : on peut envisager une poche diversifiée prudente.<br/>
      • Long terme (10 ans et +) : ETF monde / indices larges prennent du sens.`;
  }

  if (txt.includes("etf")) {
    return `
      <strong>Lecture FEIS – ETF :</strong><br/>
      • Un ETF réplique un indice (ex : MSCI World, S&P 500).<br/>
      • L’intérêt : diversification, frais souvent bas, transparence de l’indice suivi.<br/>
      • Le point clé n’est pas le “meilleur ETF”, mais la construction globale du portefeuille.`;
  }

  return `
    <strong>Réponse FEIS :</strong><br/>
    Ta question touche à plusieurs thèmes. On la traiterait en club avec :<br/>
    • horizon (court / moyen / long terme),<br/>
    • tolérance au risque et épargne de précaution,<br/>
    • rôle des indices / ETF par rapport au cash.<br/>
    Reformule avec un mot clé (livret, ETF, crypto, risque, horizon) pour une réponse plus précise.`;
}

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;
    addMessage(value, "user");
    chatInput.value = "";
    const response = answerForQuestion(value);
    setTimeout(() => addMessage(response, "bot"), 250);
  });
}

// FAQ chips -> réponses directes
const faqAnswerEl = document.getElementById("faq-answer");
const faqChips = document.querySelectorAll(".faq-chip");

const FAQ_RESPONSES = {
  livret: `
    <strong>Livret vs ETF :</strong><br/>
    • Livret : sécurité, disponibilité, aucun risque de capital (hors inflation).<br/>
    • ETF : actif de marché, valeur fluctuante, horizon plus long.<br/>
    • On les met dans deux boîtes différentes : sécurité / projet de long terme.
  `,
  risque: `
    <strong>Gérer le risque sans paniquer :</strong><br/>
    • Ne jamais investir une épargne dont tu auras besoin à court terme.<br/>
    • Fractionner les entrées (plans réguliers) pour lisser les points d’entrée.<br/>
    • Comprendre que les baisses font partie de la mécanique du marché.
  `,
  crypto: `
    <strong>Place de la crypto :</strong><br/>
    • Poche expérimentale, pas cœur de portefeuille.<br/>
    • Importance de connaître le risque de perte élevé et la volatilité.<br/>
    • On ne la travaille qu’après avoir structuré le reste (cash + ETF).
  `,
  horizon: `
    <strong>Horizon de placement :</strong><br/>
    • Plus l’horizon est long, plus l’exposition aux actions peut être importante.<br/>
    • L’horizon sert à choisir les outils (livret, obligations, actions, mix...).<br/>
    • C’est une des premières questions abordées en atelier FEIS.
  `,
  etf: `
    <strong>ETF monde :</strong><br/>
    • Réplique un panier d’actions de nombreux pays développés.<br/>
    • Permet de ne pas parier sur un seul pays ou un seul secteur.<br/>
    • C’est souvent la “brique de base” étudiée en club pour le long terme.
  `
};

faqChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const key = chip.dataset.faq;
    const html = FAQ_RESPONSES[key] || "Pas de réponse définie pour cette question.";
    faqAnswerEl.innerHTML = html;
  });
});

// --- WORKSHOPS CAROUSEL ---

const WORKSHOPS = [
  {
    tag: "Atelier marchés",
    title: "Lire une journée de marché",
    text: "On suit CAC 40, S&P 500, taux &amp; change sur une séance. Objectif : relier événements, indices et courbes."
  },
  {
    tag: "Allocation",
    title: "Construire une base ETF + cash",
    text: "Cas pratique pour un étudiant : livret de sécurité, poche ETF monde, discussion sur le risque assumé."
  },
  {
    tag: "Macro / banques centrales",
    title: "Comprendre une annonce de la BCE ou de la Fed",
    text: "Lecture d’un communiqué, impact potentiel sur les indices, la courbe des taux et la devise."
  },
  {
    tag: "Crypto labo",
    title: "Traiter la crypto comme un laboratoire",
    text: "On cartographie les risques et les scénarios sans la présenter comme solution miracle."
  }
];

const workshopContainer = document.getElementById("workshop-carousel");

if (workshopContainer) {
  WORKSHOPS.forEach((ws) => {
    const card = document.createElement("article");
    card.className = "workshop-card";
    card.innerHTML = `
      <div>
        <p class="workshop-tag">${ws.tag}</p>
        <p class="workshop-title">${ws.title}</p>
        <p class="workshop-text">${ws.text}</p>
      </div>
    `;
    workshopContainer.appendChild(card);
  });
}

// --- REVEAL ANIMATION ---

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));

// --- INIT ---

renderTable();
// pré-sélection : S&P 500 si dispo
const defaultAsset = ASSETS.find((a) => a.id === "sp500") || ASSETS[0];
if (defaultAsset) {
  selectAsset(defaultAsset.id);
}
