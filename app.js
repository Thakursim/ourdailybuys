const state = {
  allProducts: [],
  filtered: [],
  categories: new Set(),
};

const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  searchInput: document.getElementById("searchInput"),
  categorySelect: document.getElementById("categorySelect"),
  sortSelect: document.getElementById("sortSelect"),
  year: document.getElementById("year")
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toDateNum(yyyyMm) {
  // "2026-01" => 202601 (sortable)
  if (!yyyyMm || typeof yyyyMm !== "string") return 0;
  const [y, m] = yyyyMm.split("-").map(x => parseInt(x, 10));
  if (!y || !m) return 0;
  return (y * 100) + m;
}

function setStatus(text) {
  els.status.textContent = text;
}

function buildCategoryOptions() {
  // clear except "All"
  const keepFirst = els.categorySelect.querySelector('option[value="all"]');
  els.categorySelect.innerHTML = "";
  els.categorySelect.appendChild(keepFirst);

  [...state.categories].sort((a,b) => a.localeCompare(b)).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    els.categorySelect.appendChild(opt);
  });
}

function applyFilters() {
  const q = (els.searchInput.value || "").trim().toLowerCase();
  const cat = els.categorySelect.value;

  let list = state.allProducts.slice();

  if (cat !== "all") {
    list = list.filter(p => (p.category || "").toLowerCase() === cat.toLowerCase());
  }

  if (q) {
    list = list.filter(p => {
      const hay = [
        p.title,
        p.category,
        p.whyWeBoughtIt
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  // sort
  const sort = els.sortSelect.value;
  if (sort === "recent") {
    list.sort((a,b) => toDateNum(b.boughtMonth) - toDateNum(a.boughtMonth));
  } else if (sort === "rating") {
    list.sort((a,b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "name") {
    list.sort((a,b) => (a.title || "").localeCompare(b.title || ""));
  }

  state.filtered = list;
  render();
}

function render() {
  const items = state.filtered;

  if (!items.length) {
    els.grid.innerHTML = "";
    setStatus("No products match your search. Try a different keyword or category.");
    return;
  }

  setStatus(`${items.length} product${items.length === 1 ? "" : "s"} showing`);

  els.grid.innerHTML = items.map(p => {
    const title = escapeHtml(p.title || "Untitled");
    const category = escapeHtml(p.category || "General");
    const why = escapeHtml(p.whyWeBoughtIt || "");
    const rating = typeof p.rating === "number" ? p.rating.toFixed(1) : null;
    const month = p.boughtMonth ? escapeHtml(p.boughtMonth) : null;

    const url = (p.affiliateUrl || "").trim();
    const safeUrl = url ? escapeHtml(url) : "#";

    return `
      <article class="card">
        <div class="card-top">
          <h3 class="card-title">${title}</h3>
          <span class="pill">${category}</span>
        </div>

        <div class="card-body">
          <div>${why}</div>
          <div class="meta">
            ${rating ? `<small>Rating: ${rating}</small>` : ``}
            ${month ? `<small>Bought: ${month}</small>` : ``}
          </div>
        </div>

        <div class="card-actions">
          <a class="btn primary" href="${safeUrl}" target="_blank" rel="nofollow noopener">
            View on Amazon
          </a>
          <button class="btn" type="button" data-copy="${escapeHtml(url)}" ${url ? "" : "disabled"} aria-label="Copy link">
            Copy link
          </button>
        </div>
      </article>
    `;
  }).join("");

  // copy link buttons
  els.grid.querySelectorAll("button[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const val = btn.getAttribute("data-copy") || "";
      if (!val) return;
      try {
        await navigator.clipboard.writeText(val);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy link"), 900);
      } catch {
        // fallback
        prompt("Copy this link:", val);
      }
    });
  });
}

async function loadData() {
  setStatus("Loading products...");
  try {
    const res = await fetch("./products.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load products.json (${res.status})`);
    const data = await res.json();

    const products = Array.isArray(data.products) ? data.products : [];
    state.allProducts = products;

    state.categories = new Set(products.map(p => p.category).filter(Boolean));
    buildCategoryOptions();

    // initial view
    state.filtered = products.slice();
    applyFilters();
  } catch (err) {
    console.error(err);
    setStatus("Could not load products. Please check products.json and try again.");
  }
}

function init() {
  els.year.textContent = new Date().getFullYear();

  els.searchInput.addEventListener("input", () => applyFilters());
  els.categorySelect.addEventListener("change", () => applyFilters());
  els.sortSelect.addEventListener("change", () => applyFilters());

  loadData();
}

init();

