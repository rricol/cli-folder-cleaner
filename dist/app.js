const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

// ── i18n ─────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    tabCleaner: "Cleaner",
    tabTemplates: "Templates",
    targetFolder: "Target Folder",
    noFolderSelected: "No folder selected…",
    chooseFolder: "Choose Folder",
    changeFolder: "Change folder",
    openInFinder: "Open in Finder",
    favorites: "Favorites",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    noFavorites: "No favorites yet.",
    configuration: "Configuration",
    selectTemplate: "Select a template…",
    noTemplates: "No templates — create one in the Templates tab.",
    setAsDefault: "Set as default template",
    removeDefault: "Remove default template",
    dryRun: "Dry Run",
    runNow: "Run Now",
    output: "Output",
    moved: "moved",
    errors: "errors",
    unmatched: "unmatched",
    templates: "Templates",
    newTemplate: "+ New Template",
    templatePlaceholder: "Select a template or create a new one.",
    templateNamePh: "Template name…",
    unsavedChanges: "Unsaved changes",
    save: "Save",
    settingsCard: "Settings",
    recursive: "Recursive (scan sub-folders)",
    ignoreHidden: "Ignore hidden files (.*)",
    unmatchedFiles: "Unmatched files →",
    unmatchedPh: "(none)",
    unmatchedTip:
      'Files that don\'t match any rule are normally left untouched. Set a folder name here (e.g. "Other") and they will be moved there instead, leaving the target folder fully clean.',
    rules: "Rules",
    addRule: "+ Add Rule",
    ruleNamePh: "Rule name…",
    ruleDstPh: "Destination folder…",
    removeRule: "Remove rule",
    moveUp: "Move up",
    moveDown: "Move down",
    extensions: "Extensions",
    exclude: "Exclude",
    datePlaceholders: "Date",
    optionalFilters: "Optional filters",
    namePattern: "Name pattern",
    namePatternPh: "e.g. *.log",
    minSize: "Min size (MB)",
    maxSize: "Max size (MB)",
    extPh: "jpg, png, pdf…",
    excludePh: "*.tmp, secret.txt…",
    settingsTitle: "Settings",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    language: "Language",
    updates: "Updates",
    colorScheme: "Color Scheme",
    accentColor: "Accent Color",
    betaChannel: "Beta channel",
    betaChannelSub: "Receive pre-release updates",
    soon: "soon",
    updateAvailable: "⬆ Update available",
    updateAvailableTitle: "Click to install update",
    updateInstalling: "⬇ Installing…",
    updateFailed: "⚠ Update failed",
    updateFailedTitle: "Click to retry — Error: {0}",
    updateVersionTitle: "v{0} available — click to install",
    startingDryRun: "Starting dry run…",
    startingRun: "Starting run…",
    runBadgeDry: "Dry Run",
    runBadgeRun: "Run",
    failedToLink: "Failed to link template: {0}",
    failedToUnlink: "Failed to unlink: {0}",
    failedToChange: "Failed to change template: {0}",
    failedToOpen: "Failed to open folder: {0}",
    doneWithErrors: "Done with errors — {0} error(s).",
    runFailed: "Run failed: {0}",
    errorLog: "ERROR: {0}",
    loading: "Loading…",
    failedToLoad: "Failed to load: {0}",
    noTemplatesYet: "No templates yet",
    failedToLoadTmpl: "Failed to load template: {0}",
    deleteFailed: "Delete failed: {0}",
    dupFailed: "Failed to duplicate: {0}",
    tmplCopy: "{0} copy",
    tmplCopyN: "{0} copy {1}",
    tmplNameRequired: "Template name is required.",
    ruleNameRequired: "Rule {0}: name is required.",
    ruleDstRequired: 'Rule "{0}": destination is required.',
    ruleCondRequired:
      'Rule "{0}": at least one condition is required (extension, pattern or size).',
    addRuleFirst: "Add at least one rule before saving.",
    savedOk: "Saved successfully.",
    saveFailed: "Save failed: {0}",
    rulesModal: "Rules — {0}",
    ruleCount: "{0} Rule",
    ruleCountPlural: "{0} Rules",
    scanning: "Scanning",
    cleanup: "Cleanup",
    deleteEmptyDirs: "Delete empty folders after sorting",
    keepDirsLabel: "Exceptions",
    keepDirsPh: "folder name…",
    unmatchedDest: "Move to folder",
    preset: "Preset",
    presetImages: "Images",
    presetVideos: "Videos",
    presetAudio: "Audio",
    presetDocuments: "Documents",
    presetArchives: "Archives",
    presetCode: "Code",
    moveAction: "Move",
    trashAction: "Trash",
    deletedStat: "trashed",
    tabHistory: "History",
    noHistory: "No runs yet.",
    clearHistory: "Clear history",
    clearHistoryConfirm: "Clear all run history?",
    undoRun: "Undo",
    undoneLabel: "Undone",
    undoConfirm: "Undo this run? Files will be moved back to their original locations.",
    undoSuccess: "{0} file(s) restored.",
  },
  fr: {
    tabCleaner: "Nettoyeur",
    tabTemplates: "Modèles",
    targetFolder: "Dossier cible",
    noFolderSelected: "Aucun dossier sélectionné…",
    chooseFolder: "Choisir un dossier",
    changeFolder: "Changer de dossier",
    openInFinder: "Ouvrir dans le Finder",
    favorites: "Favoris",
    addToFavorites: "Ajouter aux favoris",
    removeFromFavorites: "Retirer des favoris",
    noFavorites: "Pas encore de favoris.",
    configuration: "Configuration",
    selectTemplate: "Sélectionner un modèle…",
    noTemplates: "Aucun modèle — créez-en un dans l'onglet Modèles.",
    setAsDefault: "Définir comme modèle par défaut",
    removeDefault: "Retirer le modèle par défaut",
    dryRun: "Simuler",
    runNow: "Exécuter",
    output: "Résultats",
    moved: "déplacés",
    errors: "erreurs",
    unmatched: "non triés",
    templates: "Modèles",
    newTemplate: "+ Nouveau modèle",
    templatePlaceholder: "Sélectionnez un modèle ou créez-en un.",
    templateNamePh: "Nom du modèle…",
    unsavedChanges: "Modifications non sauvegardées",
    save: "Sauvegarder",
    settingsCard: "Paramètres",
    recursive: "Récursif (inclure les sous-dossiers)",
    ignoreHidden: "Ignorer les fichiers cachés (.*)",
    unmatchedFiles: "Fichiers non classés →",
    unmatchedPh: "(aucun)",
    unmatchedTip:
      'Les fichiers ne correspondant à aucune règle sont normalement laissés intacts. Saisissez un nom de dossier ici (ex. "Autres") et ils y seront déplacés, laissant le dossier cible entièrement propre.',
    rules: "Règles",
    addRule: "+ Ajouter une règle",
    ruleNamePh: "Nom de la règle…",
    ruleDstPh: "Dossier de destination…",
    removeRule: "Supprimer la règle",
    moveUp: "Monter",
    moveDown: "Descendre",
    extensions: "Extensions",
    exclude: "Exclure",
    datePlaceholders: "Date",
    optionalFilters: "Filtres optionnels",
    namePattern: "Motif de nom",
    namePatternPh: "ex. *.log",
    minSize: "Taille min (Mo)",
    maxSize: "Taille max (Mo)",
    extPh: "jpg, png, pdf…",
    excludePh: "*.tmp, secret.txt…",
    settingsTitle: "Paramètres",
    theme: "Thème",
    dark: "Sombre",
    light: "Clair",
    system: "Système",
    language: "Langue",
    updates: "Mises à jour",
    colorScheme: "Schéma de couleurs",
    accentColor: "Couleur d'accent",
    betaChannel: "Canal bêta",
    betaChannelSub: "Recevoir les mises à jour bêta",
    soon: "bientôt",
    updateAvailable: "⬆ Mise à jour disponible",
    updateAvailableTitle: "Cliquer pour installer",
    updateInstalling: "⬇ Installation…",
    updateFailed: "⚠ Mise à jour échouée",
    updateFailedTitle: "Cliquer pour réessayer — Erreur : {0}",
    updateVersionTitle: "v{0} disponible — cliquer pour installer",
    startingDryRun: "Démarrage de la simulation…",
    startingRun: "Démarrage…",
    runBadgeDry: "Simulation",
    runBadgeRun: "Exécution",
    failedToLink: "Échec de la liaison : {0}",
    failedToUnlink: "Échec de la dissociation : {0}",
    failedToChange: "Échec du changement : {0}",
    failedToOpen: "Impossible d'ouvrir le dossier : {0}",
    doneWithErrors: "Terminé avec des erreurs — {0} erreur(s).",
    runFailed: "Échec de l'exécution : {0}",
    errorLog: "ERREUR : {0}",
    loading: "Chargement…",
    failedToLoad: "Échec du chargement : {0}",
    noTemplatesYet: "Aucun modèle",
    failedToLoadTmpl: "Échec du chargement du modèle : {0}",
    deleteFailed: "Échec de la suppression : {0}",
    dupFailed: "Échec de la duplication : {0}",
    tmplCopy: "{0} copie",
    tmplCopyN: "{0} copie {1}",
    tmplNameRequired: "Le nom du modèle est requis.",
    ruleNameRequired: "Règle {0} : le nom est requis.",
    ruleDstRequired: "Règle « {0} » : la destination est requise.",
    ruleCondRequired:
      "Règle « {0} » : au moins une condition est requise (extension, motif ou taille).",
    addRuleFirst: "Ajoutez au moins une règle avant de sauvegarder.",
    savedOk: "Sauvegardé avec succès.",
    saveFailed: "Échec de la sauvegarde : {0}",
    rulesModal: "Règles — {0}",
    ruleCount: "{0} Règle",
    ruleCountPlural: "{0} Règles",
    scanning: "Analyse",
    cleanup: "Nettoyage",
    deleteEmptyDirs: "Supprimer les dossiers vides après le tri",
    keepDirsLabel: "Exceptions",
    keepDirsPh: "nom de dossier…",
    unmatchedDest: "Déplacer vers",
    preset: "Modèle",
    presetImages: "Images",
    presetVideos: "Vidéos",
    presetAudio: "Audio",
    presetDocuments: "Documents",
    presetArchives: "Archives",
    presetCode: "Code",
    moveAction: "Déplacer",
    trashAction: "Corbeille",
    deletedStat: "corbeillés",
    tabHistory: "Historique",
    noHistory: "Aucun run pour l'instant.",
    clearHistory: "Effacer l'historique",
    clearHistoryConfirm: "Effacer tout l'historique ?",
    undoRun: "Annuler",
    undoneLabel: "Annulé",
    undoConfirm: "Annuler ce run ? Les fichiers seront remis à leur emplacement d'origine.",
    undoSuccess: "{0} fichier(s) restauré(s).",
  },
};

let currentLang = "en";

function t(key, ...args) {
  const str =
    (TRANSLATIONS[currentLang] ?? TRANSLATIONS.en)[key] ??
    TRANSLATIONS.en[key] ??
    key;
  return str.replace(/\{(\d+)\}/g, (_, i) => args[Number(i)] ?? "");
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("drustLang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-tip]").forEach((el) => {
    el.dataset.tip = t(el.dataset.i18nTip);
  });
  document
    .querySelectorAll(".lang-btn")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.lang === lang),
    );
  // Update dynamic elements
  if (!currentFolder)
    document.getElementById("folder-path").textContent = t("noFolderSelected");
  if (!linkedTemplate)
    document.getElementById("config-btn-label").textContent =
      t("selectTemplate");
  if (pendingUpdateVersion) {
    updateBadge.textContent = t("updateAvailable");
    updateBadge.title = t("updateVersionTitle", pendingUpdateVersion);
  }
  if (typeof renderRules === "function") renderRules();
}

let currentFolder = null;

// ────────────────────────────────────────────────────────────────────────────
// TAB NAVIGATION
// ────────────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    document
      .getElementById("view-cleaner")
      .classList.toggle("active", view === "cleaner");
    document
      .getElementById("view-templates")
      .classList.toggle("active", view === "templates");
    document
      .getElementById("view-history")
      .classList.toggle("active", view === "history");
    if (view === "templates") loadTmplList();
    if (view === "history") loadHistory();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CLEANER VIEW
// ────────────────────────────────────────────────────────────────────────────
const folderPathEl = document.getElementById("folder-path");
const logCard = document.getElementById("log-card");
const logOutput = document.getElementById("log-output");
const logSummary = document.getElementById("log-summary");
const logRunBadge = document.getElementById("log-run-badge");
const statMoved = document.getElementById("stat-moved");
const statDeleted = document.getElementById("stat-deleted");
const statDeletedWrap = document.getElementById("stat-deleted-wrap");
const statErrors = document.getElementById("stat-errors");
const statUnmatched = document.getElementById("stat-unmatched");
const btnUndoRun = document.getElementById("btn-undo-run");

let linkedTemplate = null; // String | null — persisted association
let selectedTemplate = null; // String | null — dropdown selection (unlinked state)
let lastRunId = null; // u128 | null — id of last real run, for inline undo

function setConfigStatus(msg, type) {
  const el = document.getElementById("config-status");
  el.textContent = msg;
  el.className = "config-status-line" + (type ? ` ${type}` : "");
}

function clearLog() {
  logOutput.textContent = "";
  logCard.classList.remove("visible");
  logSummary.style.display = "none";
  btnUndoRun.style.display = "none";
  lastRunId = null;
}

function baseName(p) {
  return p.replace(/\\/g, "/").split("/").pop() || p;
}

function parentDir(p) {
  const parts = p.replace(/\\/g, "/").split("/");
  parts.pop();
  return parts.join("/") + "/";
}

function buildLogEntry(msg) {
  const div = document.createElement("div");

  const dryMatch = msg.match(/^\[DRY-RUN\] (.+) → (.+)  \(rule: (.+)\)$/);
  const dryTrashMatch = msg.match(/^\[DRY-RUN\] TRASH (.+)  \(rule: (.+)\)$/);
  const movedMatch = msg.match(/^MOVED (.+) → (.+)  \(rule: (.+)\)$/);
  const trashedMatch = msg.match(/^TRASHED (.+)  \(rule: (.+)\)$/);
  const movedUnmatch = msg.match(/^MOVED \(unmatched\) (.+) → (.+)$/);
  const restoredMatch = msg.match(/^RESTORED (.+) → (.+)$/);
  const errorMatch = msg.match(/^ERROR (.+): (.+)$/);
  const unmatchedMatch = msg.match(/^UNMATCHED (.+)$/);

  if (dryTrashMatch || trashedMatch) {
    const [, src, rule] = dryTrashMatch || trashedMatch;
    const isDry = !!dryTrashMatch;
    div.className = "log-entry log-entry-trashed";
    div.innerHTML =
      `<span class="log-prefix">${isDry ? "~" : "🗑"}</span>` +
      `<span class="log-body">` +
        `<span class="log-row1">` +
          `<span class="log-filename">${escHtml(baseName(src))}</span>` +
          `<span class="log-rule-tag log-rule-tag-trash">${escHtml(rule)}</span>` +
        `</span>` +
        `<span class="log-dest"><span class="log-src">${escHtml(parentDir(src))}</span> → Trash${isDry ? " (dry run)" : ""}</span>` +
      `</span>`;
  } else if (dryMatch || movedMatch) {
    const [, src, dst, rule] = dryMatch || movedMatch;
    const isDry = !!dryMatch;
    div.className = "log-entry " + (isDry ? "log-entry-dry" : "log-entry-moved");
    div.innerHTML =
      `<span class="log-prefix">${isDry ? "~" : "✓"}</span>` +
      `<span class="log-body">` +
        `<span class="log-row1">` +
          `<span class="log-filename">${escHtml(baseName(src))}</span>` +
          `<span class="log-rule-tag">${escHtml(rule)}</span>` +
        `</span>` +
        `<span class="log-dest"><span class="log-src">${escHtml(parentDir(src))}</span> → ${escHtml(parentDir(dst))}</span>` +
      `</span>`;
  } else if (movedUnmatch) {
    const [, src, dst] = movedUnmatch;
    div.className = "log-entry log-entry-moved";
    div.innerHTML =
      `<span class="log-prefix">✓</span>` +
      `<span class="log-body">` +
        `<span class="log-row1">` +
          `<span class="log-filename">${escHtml(baseName(src))}</span>` +
          `<span class="log-rule-tag log-rule-tag-other">other</span>` +
        `</span>` +
        `<span class="log-dest"><span class="log-src">${escHtml(parentDir(src))}</span> → ${escHtml(parentDir(dst))}</span>` +
      `</span>`;
  } else if (restoredMatch) {
    const [, from, to] = restoredMatch;
    div.className = "log-entry log-entry-moved";
    div.innerHTML =
      `<span class="log-prefix">↩</span>` +
      `<span class="log-body">` +
        `<span class="log-row1">` +
          `<span class="log-filename">${escHtml(baseName(to))}</span>` +
          `<span class="log-rule-tag log-rule-tag-other">restored</span>` +
        `</span>` +
        `<span class="log-dest"><span class="log-src">${escHtml(parentDir(from))}</span> → ${escHtml(parentDir(to))}</span>` +
      `</span>`;
  } else if (errorMatch) {
    const [, src, errMsg] = errorMatch;
    div.className = "log-entry log-entry-error";
    div.innerHTML =
      `<span class="log-prefix">✗</span>` +
      `<span class="log-body">` +
        `<span class="log-row1"><span class="log-filename">${escHtml(baseName(src))}</span></span>` +
        `<span class="log-dest log-error-msg">${escHtml(errMsg)}</span>` +
      `</span>`;
  } else if (unmatchedMatch) {
    const [, src] = unmatchedMatch;
    div.className = "log-entry log-entry-unmatched";
    div.innerHTML =
      `<span class="log-prefix">?</span>` +
      `<span class="log-body">` +
        `<span class="log-row1"><span class="log-filename">${escHtml(baseName(src))}</span></span>` +
      `</span>`;
  } else {
    div.className = "log-entry log-entry-default";
    div.innerHTML =
      `<span class="log-prefix">·</span>` +
      `<span class="log-body">` +
        `<span class="log-row1"><span class="log-filename">${escHtml(msg)}</span></span>` +
      `</span>`;
  }

  return div;
}

function appendLog(msg) {
  logOutput.appendChild(buildLogEntry(msg));
  logOutput.scrollTop = logOutput.scrollHeight;
}

// ── Config card (folder-template binding) ────────────────────────────────
const cfgSelectBtn = document.getElementById("config-select-btn");
const cfgDropdownMenu = document.getElementById("config-dropdown-menu");
const cfgBtnLabel = document.getElementById("config-btn-label");
const cfgTemplateOpts = document.getElementById("cfg-template-opts");
const cfgNoTemplates = document.getElementById("cfg-no-templates");
const btnLinkTmpl = document.getElementById("btn-link-tmpl");
const btnDryRun = document.getElementById("btn-dry-run");
const btnRunNow = document.getElementById("btn-run-now");

cfgSelectBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  const isOpen = cfgDropdownMenu.style.display !== "none";
  if (isOpen) {
    cfgDropdownMenu.style.display = "none";
    cfgSelectBtn.classList.remove("open");
  } else {
    await loadTemplateDropdown();
    cfgDropdownMenu.style.display = "";
    cfgSelectBtn.classList.add("open");
  }
});

document.addEventListener("click", () => {
  cfgDropdownMenu.style.display = "none";
  cfgSelectBtn.classList.remove("open");
});

cfgDropdownMenu.addEventListener("click", (e) => e.stopPropagation());

const LINK_ICON_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

function updateLinkBtn() {
  const isLinked = selectedTemplate !== null && selectedTemplate === linkedTemplate;
  btnLinkTmpl.classList.toggle("linked", isLinked);
  btnLinkTmpl.disabled = selectedTemplate === null;
  btnLinkTmpl.title = isLinked ? t("removeDefault") : t("setAsDefault");
  btnDryRun.disabled = selectedTemplate === null;
  btnRunNow.disabled = selectedTemplate === null;
}

async function loadTemplateDropdown() {
  const names = await invoke("list_templates");
  cfgTemplateOpts.innerHTML = "";

  // Preserve current selection if still in the list, otherwise fall back to linked template
  const keepSelection = selectedTemplate && names.includes(selectedTemplate);
  selectedTemplate = keepSelection ? selectedTemplate : linkedTemplate;
  cfgBtnLabel.textContent = selectedTemplate ?? t("selectTemplate");

  if (names.length === 0) {
    cfgNoTemplates.style.display = "";
  } else {
    cfgNoTemplates.style.display = "none";
    for (const name of names) {
      const opt = document.createElement("div");
      opt.className = "config-opt" + (name === selectedTemplate ? " selected" : "");
      opt.dataset.value = name;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name;
      opt.appendChild(nameSpan);

      if (name === linkedTemplate) {
        const icon = document.createElement("span");
        icon.className = "config-opt-link-icon";
        icon.innerHTML = LINK_ICON_SVG;
        opt.appendChild(icon);
      }

      opt.addEventListener("click", () => {
        selectedTemplate = name;
        cfgBtnLabel.textContent = name;
        cfgTemplateOpts.querySelectorAll(".config-opt").forEach((o) =>
          o.classList.toggle("selected", o.dataset.value === name),
        );
        cfgDropdownMenu.style.display = "none";
        cfgSelectBtn.classList.remove("open");
        updateLinkBtn();
      });
      cfgTemplateOpts.appendChild(opt);
    }
  }
  updateLinkBtn();
}

async function loadFolderAssociation() {
  linkedTemplate = await invoke("get_folder_association", {
    folderPath: currentFolder,
  });
}

btnLinkTmpl.addEventListener("click", async () => {
  if (!selectedTemplate || !currentFolder) return;
  btnLinkTmpl.disabled = true;
  try {
    if (selectedTemplate === linkedTemplate) {
      await invoke("remove_folder_association", { folderPath: currentFolder });
      linkedTemplate = null;
    } else {
      await invoke("set_folder_association", {
        folderPath: currentFolder,
        templateName: selectedTemplate,
      });
      linkedTemplate = selectedTemplate;
    }
    invoke("refresh_tray_menu");
    await loadTemplateDropdown();
    setConfigStatus("");
  } catch (e) {
    setConfigStatus(t("failedToLink", e), "err");
    updateLinkBtn();
  }
});

btnDryRun.addEventListener("click", () => runWithTemplate(true));
btnRunNow.addEventListener("click", () => runWithTemplate(false));

function makeBtn(label, cls, onClick) {
  const btn = document.createElement("button");
  btn.className = `btn ${cls}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// ── Folder pick ────────────────────────────────────────────────────────────
const btnPick = document.getElementById("btn-pick");
const btnChangeFolder = document.getElementById("btn-change-folder");
const btnOpenFolder = document.getElementById("btn-open-folder");
const btnFavToggle = document.getElementById("btn-fav-toggle");
const btnFavList = document.getElementById("btn-fav-list");
const favDropdown = document.getElementById("fav-dropdown");
const favListItems = document.getElementById("fav-list-items");
const favEmpty = document.getElementById("fav-empty");

let favorites = [];

async function selectFolder(path) {
  currentFolder = path;
  folderPathEl.textContent = path;
  folderPathEl.classList.add("has-value");
  btnPick.style.display = "none";
  btnChangeFolder.classList.add("visible");
  btnOpenFolder.classList.add("visible");
  btnFavToggle.classList.add("visible");
  clearLog();
  setConfigStatus("");
  document.getElementById("config-card").style.display = "block";
  selectedTemplate = null;
  await loadFolderAssociation();
  await loadTemplateDropdown();
  updateFavToggle();
}

async function pickFolder() {
  const path = await open({ directory: true, multiple: false });
  if (!path) return;
  await selectFolder(path);
}

function updateFavToggle() {
  const isFav = currentFolder && favorites.includes(currentFolder);
  btnFavToggle.classList.toggle("active", !!isFav);
  btnFavToggle.title = isFav ? t("removeFromFavorites") : t("addToFavorites");
}

function renderFavDropdown() {
  favListItems.innerHTML = "";
  if (favorites.length === 0) {
    favEmpty.style.display = "";
    btnFavList.classList.remove("has-items");
  } else {
    favEmpty.style.display = "none";
    btnFavList.classList.add("has-items");
    for (const path of favorites) {
      const name = path.split("/").filter(Boolean).pop() ?? path;
      const item = document.createElement("div");
      item.className = "fav-item" + (path === currentFolder ? " current" : "");

      const info = document.createElement("div");
      info.className = "fav-item-info";
      const nameEl = document.createElement("span");
      nameEl.className = "fav-item-name";
      nameEl.textContent = name;
      const pathEl = document.createElement("span");
      pathEl.className = "fav-item-path";
      pathEl.textContent = path;
      info.appendChild(nameEl);
      info.appendChild(pathEl);

      const removeBtn = document.createElement("button");
      removeBtn.className = "fav-item-remove";
      removeBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      removeBtn.title = t("removeFromFavorites");
      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await invoke("remove_favorite", { folderPath: path });
        favorites = favorites.filter((f) => f !== path);
        invoke("refresh_tray_menu");
        renderFavDropdown();
        updateFavToggle();
      });

      item.appendChild(info);
      item.appendChild(removeBtn);
      item.addEventListener("click", () => {
        closeFavDropdown();
        selectFolder(path);
      });
      favListItems.appendChild(item);
    }
  }
}

async function loadFavorites() {
  try {
    favorites = await invoke("get_favorites");
  } catch {
    favorites = [];
  }
  renderFavDropdown();
  updateFavToggle();
}

function closeFavDropdown() {
  favDropdown.style.display = "none";
  btnFavList.classList.remove("open");
}

btnFavList.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = favDropdown.style.display !== "none";
  if (isOpen) {
    closeFavDropdown();
  } else {
    renderFavDropdown();
    favDropdown.style.display = "";
    btnFavList.classList.add("open");
  }
});

document.addEventListener("click", closeFavDropdown);
favDropdown.addEventListener("click", (e) => e.stopPropagation());

btnFavToggle.addEventListener("click", async () => {
  if (!currentFolder) return;
  const isFav = favorites.includes(currentFolder);
  if (isFav) {
    await invoke("remove_favorite", { folderPath: currentFolder });
    favorites = favorites.filter((f) => f !== currentFolder);
  } else {
    await invoke("add_favorite", { folderPath: currentFolder });
    favorites = [...favorites, currentFolder];
  }
  invoke("refresh_tray_menu");
  renderFavDropdown();
  updateFavToggle();
});

btnPick.addEventListener("click", pickFolder);
btnChangeFolder.addEventListener("click", pickFolder);

btnOpenFolder.addEventListener("click", async () => {
  if (!currentFolder) return;
  try {
    await invoke("open_folder", { folderPath: currentFolder });
  } catch (e) {
    setConfigStatus(t("failedToOpen", e), "err");
  }
});

// ── Run with linked template ───────────────────────────────────────────────
async function runWithTemplate(dryRun) {
  if (!currentFolder || !selectedTemplate) return;
  [btnDryRun, btnRunNow].forEach((b) => (b.disabled = true));
  clearLog();
  logCard.classList.add("visible");
  try {
    const result = await invoke("run_with_template", {
      folderPath: currentFolder,
      templateName: selectedTemplate,
      dryRun,
    });
    for (const msg of result.messages) appendLog(msg);
    statMoved.textContent = result.moved;
    statDeleted.textContent = result.deleted;
    statDeletedWrap.style.display = result.deleted > 0 ? "" : "none";
    statErrors.textContent = result.errors;
    statUnmatched.textContent = result.unmatched;
    const hasErr = result.errors > 0;
    logRunBadge.textContent = dryRun ? t("runBadgeDry") : t("runBadgeRun");
    logRunBadge.className =
      "run-badge " + (dryRun ? "dry" : hasErr ? "err" : "run");
    logSummary.style.display = "flex";
    if (!dryRun && result.run_id && result.moved > 0) {
      lastRunId = result.run_id;
      btnUndoRun.style.display = "";
    } else {
      lastRunId = null;
      btnUndoRun.style.display = "none";
    }
    if (hasErr && !dryRun) {
      setConfigStatus(t("doneWithErrors", result.errors), "err");
    } else {
      setConfigStatus("", "");
    }
  } catch (e) {
    appendLog(t("errorLog", e));
    setConfigStatus(t("runFailed", e), "err");
  } finally {
    updateLinkBtn();
  }
}

// ── Inline undo (cleaner page) ────────────────────────────────────────────
btnUndoRun.addEventListener("click", async () => {
  if (!lastRunId || !confirm(t("undoConfirm"))) return;
  const idToUndo = lastRunId;
  clearLog();
  logCard.classList.add("visible");
  try {
    const result = await invoke("undo_run", { id: idToUndo });
    for (const msg of result.messages) appendLog(msg);
    statMoved.textContent = result.moved;
    statDeleted.textContent = 0;
    statDeletedWrap.style.display = "none";
    statErrors.textContent = result.errors;
    statUnmatched.textContent = 0;
    logRunBadge.textContent = t("undoneLabel");
    logRunBadge.className = "run-badge " + (result.errors > 0 ? "err" : "run");
    logSummary.style.display = "flex";
  } catch (e) {
    appendLog(t("errorLog", e));
  }
});

// ── Modal ────────────────────────────────────────────────────────────────
const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const modalFooter = document.getElementById("modal-footer");

function closeModal() {
  modalBackdrop.classList.remove("visible");
  modalBody.innerHTML = "";
  modalFooter.innerHTML = "";
  modalFooter.style.display = "none";
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function renderModalInfo(info) {
  const settingsTags = [
    `<span class="modal-tag ${info.recursive ? "on" : ""}">recursive: ${info.recursive}</span>`,
    `<span class="modal-tag ${info.ignore_hidden ? "on" : ""}">ignore hidden: ${info.ignore_hidden}</span>`,
    ...(info.unmatched_destination
      ? [
          `<span class="modal-tag on">unmatched → ${escHtml(info.unmatched_destination)}</span>`,
        ]
      : []),
  ];
  const rulesHtml = info.rules
    .map((r) => {
      const exts = r.extensions
        .map((e) => `<span class="ext-chip">.${escHtml(e)}</span>`)
        .join("");
      const meta = [];
      if (r.name_pattern)
        meta.push(`pattern: <code>${escHtml(r.name_pattern)}</code>`);
      if (r.min_size_mb != null) meta.push(`min ${r.min_size_mb} MB`);
      if (r.max_size_mb != null) meta.push(`max ${r.max_size_mb} MB`);
      return `<div class="rule-row">
        <div class="rule-row-header"><span class="rule-name">${escHtml(r.name)}</span><span class="rule-dest">→ ${escHtml(r.destination)}/</span></div>
        ${exts ? `<div class="rule-ext-list">${exts}</div>` : ""}
        ${meta.length ? `<div class="rule-meta">${meta.join(" · ")}</div>` : ""}
      </div>`;
    })
    .join("");
  modalBody.innerHTML = `
      <div><div class="modal-section-title">${t("settingsCard")}</div><div class="modal-settings">${settingsTags.join("")}</div></div>
      <div><div class="modal-section-title">${info.rules.length !== 1 ? t("ruleCountPlural", info.rules.length) : t("ruleCount", info.rules.length)}</div><div style="display:flex;flex-direction:column;gap:6px">${rulesHtml}</div></div>
    `;
}

async function showTemplateRules(name) {
  modalTitle.textContent = t("rulesModal", name);
  modalBody.innerHTML = `<div style="color:var(--text-dim);font-size:.85rem">${t("loading")}</div>`;
  modalFooter.style.display = "none";
  modalBackdrop.classList.add("visible");
  let info;
  try {
    info = await invoke("get_template_rules", {
      templateName: name,
    });
  } catch (err) {
    modalBody.innerHTML = `<div style="color:var(--red)">${t("failedToLoad", err)}</div>`;
    return;
  }
  renderModalInfo(info);
}

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATES MANAGEMENT VIEW
// ────────────────────────────────────────────────────────────────────────────

// ── Extension presets ──────────────────────────────────────────────────────
const EXT_PRESETS = [
  { key: "images",    labelKey: "presetImages",    exts: ["jpg","jpeg","png","gif","webp","svg","heic","tiff","bmp","raw"] },
  { key: "videos",    labelKey: "presetVideos",    exts: ["mp4","mov","avi","mkv","wmv","flv","webm","m4v","3gp"] },
  { key: "audio",     labelKey: "presetAudio",     exts: ["mp3","wav","flac","aac","ogg","m4a","wma","opus","aiff"] },
  { key: "documents", labelKey: "presetDocuments", exts: ["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","rtf","odt","ods","pages","numbers","key","epub","md"] },
  { key: "archives",  labelKey: "presetArchives",  exts: ["zip","rar","7z","tar","gz","bz2","xz","dmg","iso","pkg"] },
  { key: "code",      labelKey: "presetCode",      exts: ["js","ts","jsx","tsx","py","rs","go","java","cpp","c","h","cs","php","rb","swift","kt","css","html","json","yaml","yml","toml","xml","sh"] },
];

// ── State ──────────────────────────────────────────────────────────────────
let tmplOriginalName = null; // null = new unsaved template
let tmplRules = []; // [{name, destination, extensions, namePattern, minSizeMb, maxSizeMb}]
let tmplKeepDirs = [];
let tmplDirty = false;

const tmplSidebarList = document.getElementById("tmpl-sidebar-list");
const tmplPlaceholder = document.getElementById("tmpl-placeholder");
const tmplForm = document.getElementById("tmpl-form");
const tmplNameInput = document.getElementById("tmpl-name-input");
const tmplDirtyDot = document.getElementById("tmpl-dirty-dot");
const tmplRecursive = document.getElementById("tmpl-recursive");
const tmplIgnoreHidden = document.getElementById("tmpl-ignore-hidden");
const tmplUnmatched = document.getElementById("tmpl-unmatched");
const tmplDeleteEmptyDirs = document.getElementById("tmpl-delete-empty-dirs");
const keepDirsWrap = document.getElementById("keep-dirs-wrap");
const tmplRulesList = document.getElementById("tmpl-rules-list");
const tmplRulesCountBadge = document.getElementById("tmpl-rules-count");
const tmplStatusEl = document.getElementById("tmpl-status");
const tmplFooter = document.getElementById("tmpl-footer");
const btnTmplSave = document.getElementById("btn-tmpl-save");
const btnAddRule = document.getElementById("btn-add-rule");
const btnNewTemplate = document.getElementById("btn-new-template");

// ── Helpers ────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escAttr(s) {
  return escHtml(s);
}

function setTmplDirty(v) {
  tmplDirty = v;
  tmplDirtyDot.classList.toggle("visible", v);
}

function setTmplStatus(msg, type) {
  tmplStatusEl.textContent = msg;
  tmplStatusEl.className = ""; // reset
  if (type) tmplStatusEl.classList.add(type);
}

// ── Global close for preset dropdowns ─────────────────────────────────────
document.addEventListener("click", (e) => {
  if (!e.target.closest(".rule-preset-wrap")) {
    document
      .querySelectorAll(".rule-preset-dropdown.open")
      .forEach((d) => d.classList.remove("open"));
  }
});

// ── Tab switching ──────────────────────────────────────────────────────────
document.querySelectorAll(".tmpl-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tmpl-tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tmpl-tab-content")
      .forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document
      .getElementById(`tmpl-tab-${tab.dataset.tab}`)
      ?.classList.add("active");
  });
});

// ── keep_dirs chip rendering ───────────────────────────────────────────────
function renderKeepDirs() {
  keepDirsWrap.innerHTML = "";
  for (const dir of tmplKeepDirs) {
    keepDirsWrap.appendChild(makeKeepDirChip(dir));
  }
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "ext-text-input";
  inp.placeholder = tmplKeepDirs.length ? "" : t("keepDirsPh");
  inp.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === ",") && inp.value.trim()) {
      e.preventDefault();
      addKeepDir(inp.value, inp);
    } else if (e.key === "Backspace" && !inp.value && tmplKeepDirs.length) {
      tmplKeepDirs.pop();
      renderKeepDirs();
      keepDirsWrap.querySelector(".ext-text-input")?.focus();
      setTmplDirty(true);
    }
  });
  inp.addEventListener("blur", () => {
    if (inp.value.trim()) addKeepDir(inp.value, inp);
  });
  keepDirsWrap.appendChild(inp);
  keepDirsWrap.addEventListener("click", () => inp.focus());
}

function addKeepDir(raw, inp) {
  const dir = raw.trim();
  if (dir && !tmplKeepDirs.includes(dir)) {
    tmplKeepDirs.push(dir);
    keepDirsWrap.insertBefore(makeKeepDirChip(dir), inp);
    setTmplDirty(true);
  }
  inp.value = "";
}

function makeKeepDirChip(dir) {
  const chip = document.createElement("span");
  chip.className = "ext-chip-editor ignore-chip";
  chip.innerHTML = `${escHtml(dir)}<button class="ext-chip-remove" title="Remove">×</button>`;
  chip.querySelector(".ext-chip-remove").addEventListener("click", () => {
    tmplKeepDirs = tmplKeepDirs.filter((d) => d !== dir);
    renderKeepDirs();
    setTmplDirty(true);
  });
  return chip;
}

// ── Sidebar ────────────────────────────────────────────────────────────────
async function loadTmplList(selectName) {
  const names = await invoke("list_templates");
  tmplSidebarList.innerHTML = "";

  if (names.length === 0) {
    tmplSidebarList.innerHTML = `<div style="padding:12px 14px;font-size:.82rem;color:var(--text-dim)">${t("noTemplatesYet")}</div>`;
  }

  for (const name of names) {
    const item = document.createElement("div");
    item.className = "tmpl-sidebar-item";
    item.dataset.name = name;
    item.innerHTML = `
        <span class="tmpl-sidebar-item-name">${escHtml(name)}</span>
        <button class="tmpl-sidebar-action tmpl-sidebar-dupe"   title="Duplicate">⧉</button>
        <button class="tmpl-sidebar-action tmpl-sidebar-delete" title="Delete">×</button>
      `;
    item.addEventListener("click", (e) => {
      if (e.target.closest(".tmpl-sidebar-action")) return;
      selectTemplate(name);
    });
    item
      .querySelector(".tmpl-sidebar-dupe")
      .addEventListener("click", async (e) => {
        e.stopPropagation();
        await duplicateTmpl(name);
      });
    item
      .querySelector(".tmpl-sidebar-delete")
      .addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteTmpl(name);
      });
    tmplSidebarList.appendChild(item);
  }

  if (selectName) {
    const activeItem = tmplSidebarList.querySelector(
      `[data-name="${CSS.escape(selectName)}"]`,
    );
    if (activeItem) activeItem.classList.add("active");
  }
}

function highlightSidebarItem(name) {
  tmplSidebarList.querySelectorAll(".tmpl-sidebar-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.name === name);
  });
}

// ── Select / load template ─────────────────────────────────────────────────
function showTmplForm() {
  tmplPlaceholder.style.display = "none";
  tmplForm.classList.add("visible");
  tmplFooter.style.display = "flex";
}

function hideTmplForm() {
  tmplForm.classList.remove("visible");
  tmplFooter.style.display = "none";
  tmplPlaceholder.style.display = "";
}

async function selectTemplate(name) {
  highlightSidebarItem(name);
  showTmplForm();
  setTmplStatus("");

  let info;
  try {
    info = await invoke("get_template_rules", {
      templateName: name,
    });
  } catch (err) {
    setTmplStatus(t("failedToLoadTmpl", err), "err");
    return;
  }

  tmplOriginalName = name;
  tmplNameInput.value = name;
  tmplRecursive.checked = info.recursive;
  tmplIgnoreHidden.checked = info.ignore_hidden;
  tmplUnmatched.value = info.unmatched_destination ?? "";
  tmplDeleteEmptyDirs.checked = info.delete_empty_dirs ?? false;
  tmplKeepDirs = [...(info.keep_dirs ?? [])];
  renderKeepDirs();
  tmplRules = info.rules.map((r) => ({
    name: r.name,
    destination: r.destination,
    delete: r.delete ?? false,
    extensions: [...r.extensions],
    namePattern: r.name_pattern ?? "",
    minSizeMb: r.min_size_mb != null ? String(r.min_size_mb) : "",
    maxSizeMb: r.max_size_mb != null ? String(r.max_size_mb) : "",
    ignore: [...(r.ignore ?? [])],
  }));

  renderRules();
  setTmplDirty(false);
}

// ── New template ───────────────────────────────────────────────────────────
btnNewTemplate.addEventListener("click", () => {
  highlightSidebarItem(null);
  showTmplForm();
  tmplOriginalName = null;
  tmplNameInput.value = "";
  tmplRecursive.checked = false;
  tmplIgnoreHidden.checked = true;
  tmplUnmatched.value = "";
  tmplDeleteEmptyDirs.checked = false;
  tmplKeepDirs = [];
  renderKeepDirs();
  tmplRules = [];
  renderRules();
  setTmplDirty(false);
  setTmplStatus("");
  tmplNameInput.focus();
});

// ── Dirty tracking ─────────────────────────────────────────────────────────
[tmplNameInput, tmplUnmatched].forEach((el) =>
  el.addEventListener("input", () => setTmplDirty(true)),
);
tmplRecursive.addEventListener("change", () => setTmplDirty(true));
tmplIgnoreHidden.addEventListener("change", () => setTmplDirty(true));
tmplDeleteEmptyDirs.addEventListener("change", () => setTmplDirty(true));

// ── Rules rendering ────────────────────────────────────────────────────────
function renderRules() {
  tmplRulesList.innerHTML = "";
  tmplRules.forEach((rule, idx) => {
    tmplRulesList.appendChild(buildRuleCard(rule, idx));
  });
  if (tmplRulesCountBadge) tmplRulesCountBadge.textContent = tmplRules.length;
}

function buildRuleCard(rule, idx) {
  const card = document.createElement("div");
  card.className = "rule-editor-card";

  const presetOptionsHtml = EXT_PRESETS.map(
    (p) =>
      `<div class="rule-preset-option" data-preset-key="${p.key}">${t(p.labelKey)}</div>`,
  ).join("");

  if (rule.delete) card.classList.add("rule-card--delete");

  card.innerHTML = `
      <div class="rule-card-header">
        <div class="rule-order-btns">
          <button class="rule-order-btn" data-dir="up"   title="${t("moveUp")}"   ${idx === 0 ? "disabled" : ""}></button>
          <button class="rule-order-btn" data-dir="down" title="${t("moveDown")}" ${idx === tmplRules.length - 1 ? "disabled" : ""}></button>
        </div>
        <input type="text" class="rule-name-inp" placeholder="${t("ruleNamePh")}" value="${escAttr(rule.name)}" />
        <div class="rule-action-toggle">
          <button class="rule-action-btn${!rule.delete ? " active" : ""}" data-action="move">${t("moveAction")}</button>
          <button class="rule-action-btn trash${rule.delete ? " active" : ""}" data-action="trash">${t("trashAction")}</button>
        </div>
        <button class="rule-delete-btn" title="${t("removeRule")}">×</button>
      </div>
      <div class="rule-dest-row" ${rule.delete ? 'style="display:none"' : ""}>
        <span class="rule-arrow">→</span>
        <input type="text" class="rule-dest-inp" placeholder="${t("ruleDstPh")}" value="${escAttr(rule.destination)}" />
        <div class="date-ph-chips">
          <button class="date-ph-chip" data-ph="{year}">{year}</button>
          <button class="date-ph-chip" data-ph="{month}">{month}</button>
          <button class="date-ph-chip" data-ph="{month_num}">{month_num}</button>
          <button class="date-ph-chip" data-ph="{day}">{day}</button>
        </div>
      </div>
      <div class="rule-card-body">
        <div class="rule-col">
          <div class="rule-col-header">
            <span class="rule-field-label">${t("extensions")}</span>
            <div class="rule-preset-wrap">
              <button class="rule-preset-btn">${t("preset")} ▾</button>
              <div class="rule-preset-dropdown">${presetOptionsHtml}</div>
            </div>
          </div>
          <div class="ext-input-wrap" data-idx="${idx}"></div>
        </div>
        <div class="rule-col">
          <div class="rule-col-header">
            <span class="rule-field-label">${t("exclude")}</span>
          </div>
          <div class="ext-input-wrap ignore-input-wrap" data-idx="${idx}"></div>
        </div>
      </div>
      <details class="rule-optional">
        <summary>${t("optionalFilters")}</summary>
        <div class="rule-optional-body">
          <div class="rule-opt-row">
            <span class="rule-opt-label">${t("namePattern")}</span>
            <input type="text" class="rule-opt-input rule-pattern-inp" placeholder="${t("namePatternPh")}" value="${escAttr(rule.namePattern)}" />
          </div>
          <div class="rule-opt-row">
            <span class="rule-opt-label">${t("minSize")}</span>
            <input type="number" class="rule-opt-input rule-min-inp" placeholder="—" min="0" step="0.1" value="${escAttr(rule.minSizeMb)}" />
          </div>
          <div class="rule-opt-row">
            <span class="rule-opt-label">${t("maxSize")}</span>
            <input type="number" class="rule-opt-input rule-max-inp" placeholder="—" min="0" step="0.1" value="${escAttr(rule.maxSizeMb)}" />
          </div>
        </div>
      </details>
    `;

  // Extension chip input
  const extWrap = card.querySelector(".ext-input-wrap");
  buildExtChips(extWrap, rule.extensions, idx);

  // Ignore chip input
  const ignoreWrap = card.querySelector(".ignore-input-wrap");
  buildIgnoreChips(ignoreWrap, rule.ignore, idx);

  // Field bindings
  card.querySelector(".rule-name-inp").addEventListener("input", (e) => {
    tmplRules[idx].name = e.target.value;
    setTmplDirty(true);
  });
  card.querySelector(".rule-dest-inp").addEventListener("input", (e) => {
    tmplRules[idx].destination = e.target.value;
    setTmplDirty(true);
  });
  card.querySelector(".rule-pattern-inp").addEventListener("input", (e) => {
    tmplRules[idx].namePattern = e.target.value;
    setTmplDirty(true);
  });
  card.querySelector(".rule-min-inp").addEventListener("input", (e) => {
    tmplRules[idx].minSizeMb = e.target.value;
    setTmplDirty(true);
  });
  card.querySelector(".rule-max-inp").addEventListener("input", (e) => {
    tmplRules[idx].maxSizeMb = e.target.value;
    setTmplDirty(true);
  });

  // Action toggle (Move / Trash)
  card.querySelectorAll(".rule-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isTrash = btn.dataset.action === "trash";
      tmplRules[idx].delete = isTrash;
      card.querySelectorAll(".rule-action-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.action === (isTrash ? "trash" : "move"));
      });
      card.classList.toggle("rule-card--delete", isTrash);
      card.querySelector(".rule-dest-row").style.display = isTrash ? "none" : "";
      setTmplDirty(true);
    });
  });

  // Date placeholder chips
  const destInp = card.querySelector(".rule-dest-inp");
  card.querySelectorAll(".date-ph-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const sep = destInp.value && !destInp.value.endsWith("/") ? "/" : "";
      destInp.value += sep + chip.dataset.ph;
      tmplRules[idx].destination = destInp.value;
      setTmplDirty(true);
      destInp.focus();
    });
  });

  // Preset dropdown
  const presetBtn = card.querySelector(".rule-preset-btn");
  const presetDropdown = card.querySelector(".rule-preset-dropdown");
  presetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    presetDropdown.classList.toggle("open");
  });
  presetDropdown.querySelectorAll(".rule-preset-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const preset = EXT_PRESETS.find((p) => p.key === opt.dataset.presetKey);
      if (!preset) return;
      // Merge extensions (avoid duplicates)
      for (const ext of preset.exts) {
        if (!tmplRules[idx].extensions.includes(ext))
          tmplRules[idx].extensions.push(ext);
      }
      presetDropdown.classList.remove("open");
      renderRules();
      setTmplDirty(true);
    });
  });
  // Dropdown closes via global handler below (see closeAllPresets)

  // Delete rule
  card.querySelector(".rule-delete-btn").addEventListener("click", () => {
    tmplRules.splice(idx, 1);
    renderRules();
    setTmplDirty(true);
  });

  // Up / down reorder
  card.querySelectorAll(".rule-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir;
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= tmplRules.length) return;
      [tmplRules[idx], tmplRules[swap]] = [tmplRules[swap], tmplRules[idx]];
      renderRules();
      setTmplDirty(true);
    });
  });

  return card;
}

// ── Extension chip input ───────────────────────────────────────────────────
function buildExtChips(wrap, extensions, idx) {
  wrap.innerHTML = "";
  for (const ext of extensions) {
    wrap.appendChild(makeChip(ext, idx));
  }
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "ext-text-input";
  textInput.placeholder = extensions.length ? "" : t("extPh");

  textInput.addEventListener("keydown", (e) => {
    if (
      (e.key === "Enter" || e.key === "," || e.key === " ") &&
      textInput.value.trim()
    ) {
      e.preventDefault();
      addExt(textInput.value, idx, wrap, textInput);
    } else if (
      e.key === "Backspace" &&
      !textInput.value &&
      tmplRules[idx].extensions.length
    ) {
      tmplRules[idx].extensions.pop();
      wrap.querySelectorAll(".ext-chip-editor").forEach((c, i, arr) => {
        if (i === arr.length - 1) c.remove();
      });
      textInput.placeholder = tmplRules[idx].extensions.length ? "" : t("extPh");
      setTmplDirty(true);
    }
  });

  textInput.addEventListener("blur", () => {
    if (textInput.value.trim()) addExt(textInput.value, idx, wrap, textInput);
  });

  wrap.appendChild(textInput);
  wrap.addEventListener("click", () => textInput.focus());
}

function addExt(raw, idx, wrap, textInput) {
  const ext = raw.trim().replace(/^\./, "").toLowerCase();
  if (ext && !tmplRules[idx].extensions.includes(ext)) {
    tmplRules[idx].extensions.push(ext);
    const chip = makeChip(ext, idx);
    wrap.insertBefore(chip, textInput);
    setTmplDirty(true);
  }
  textInput.value = "";
}

function makeChip(ext, idx) {
  const chip = document.createElement("span");
  chip.className = "ext-chip-editor";
  chip.innerHTML = `.${escHtml(ext)}<button class="ext-chip-remove" title="Remove">×</button>`;
  chip.querySelector(".ext-chip-remove").addEventListener("click", () => {
    tmplRules[idx].extensions = tmplRules[idx].extensions.filter(
      (e) => e !== ext,
    );
    const wrap = chip.parentElement;
    chip.remove();
    const textInput = wrap?.querySelector(".ext-text-input");
    if (textInput) {
      textInput.placeholder = tmplRules[idx].extensions.length ? "" : t("extPh");
      textInput.focus();
    }
    setTmplDirty(true);
  });
  return chip;
}

// ── Ignore chip input ──────────────────────────────────────────────────────
function buildIgnoreChips(wrap, ignoreList, idx) {
  wrap.innerHTML = "";
  for (const pattern of ignoreList) {
    wrap.appendChild(makeIgnoreChip(pattern, idx));
  }
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.className = "ext-text-input";
  textInput.placeholder = ignoreList.length ? "" : t("excludePh");

  textInput.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === ",") && textInput.value.trim()) {
      e.preventDefault();
      addIgnorePattern(textInput.value, idx, wrap, textInput);
    } else if (
      e.key === "Backspace" &&
      !textInput.value &&
      tmplRules[idx].ignore.length
    ) {
      tmplRules[idx].ignore.pop();
      wrap.querySelectorAll(".ext-chip-editor").forEach((c, i, arr) => {
        if (i === arr.length - 1) c.remove();
      });
      textInput.placeholder = tmplRules[idx].ignore.length ? "" : t("excludePh");
      setTmplDirty(true);
    }
  });

  textInput.addEventListener("blur", () => {
    if (textInput.value.trim())
      addIgnorePattern(textInput.value, idx, wrap, textInput);
  });

  wrap.appendChild(textInput);
  wrap.addEventListener("click", () => textInput.focus());
}

function addIgnorePattern(raw, idx, wrap, textInput) {
  const pattern = raw.trim();
  if (pattern && !tmplRules[idx].ignore.includes(pattern)) {
    tmplRules[idx].ignore.push(pattern);
    wrap.insertBefore(makeIgnoreChip(pattern, idx), textInput);
    setTmplDirty(true);
  }
  textInput.value = "";
}

function makeIgnoreChip(pattern, idx) {
  const chip = document.createElement("span");
  chip.className = "ext-chip-editor ignore-chip";
  chip.innerHTML = `${escHtml(pattern)}<button class="ext-chip-remove" title="Remove">×</button>`;
  chip.querySelector(".ext-chip-remove").addEventListener("click", () => {
    tmplRules[idx].ignore = tmplRules[idx].ignore.filter((p) => p !== pattern);
    const wrap = chip.parentElement;
    chip.remove();
    const textInput = wrap?.querySelector(".ext-text-input");
    if (textInput) {
      textInput.placeholder = tmplRules[idx].ignore.length ? "" : t("excludePh");
      textInput.focus();
    }
    setTmplDirty(true);
  });
  return chip;
}

// ── Add rule ───────────────────────────────────────────────────────────────
btnAddRule.addEventListener("click", () => {
  // Switch to rules tab if not already active
  const rulesTab = document.querySelector('.tmpl-tab[data-tab="rules"]');
  if (rulesTab && !rulesTab.classList.contains("active")) {
    document.querySelectorAll(".tmpl-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tmpl-tab-content").forEach((c) => c.classList.remove("active"));
    rulesTab.classList.add("active");
    document.getElementById("tmpl-tab-rules")?.classList.add("active");
  }

  tmplRules.push({
    name: "",
    destination: "",
    delete: false,
    extensions: [],
    namePattern: "",
    minSizeMb: "",
    maxSizeMb: "",
    ignore: [],
  });
  renderRules();
  setTmplDirty(true);

  // Focus and scroll to the new rule's name input
  const nameInputs = tmplRulesList.querySelectorAll(".rule-name-inp");
  const lastInput = nameInputs[nameInputs.length - 1];
  if (lastInput) {
    lastInput.focus();
    lastInput.closest(".rule-editor-card")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

// ── Delete template ────────────────────────────────────────────────────────
async function deleteTmpl(name) {
  try {
    await invoke("delete_template", { templateName: name });
    if (tmplOriginalName === name) {
      tmplOriginalName = null;
      hideTmplForm();
    }
    await loadTmplList();
  } catch (err) {
    setTmplStatus(t("deleteFailed", err), "err");
  }
}

// ── TOML builder ───────────────────────────────────────────────────────────
function q(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildTomlFromData(recursive, ignoreHidden, unmatched, deleteEmptyDirs, keepDirs, rules) {
  let out = "[settings]\n";
  out += `recursive = ${recursive}\n`;
  out += `ignore_hidden = ${ignoreHidden}\n`;
  if (unmatched.trim())
    out += `unmatched_destination = "${q(unmatched.trim())}"\n`;
  if (deleteEmptyDirs) {
    out += `delete_empty_dirs = true\n`;
    if (keepDirs.length)
      out += `keep_dirs = [${keepDirs.map((d) => `"${q(d)}"`).join(", ")}]\n`;
  }
  out += "\n";
  for (const r of rules) {
    out += "[[rules]]\n";
    out += `name = "${q(r.name)}"\n`;
    if (r.delete) {
      out += `delete = true\n`;
    } else {
      out += `destination = "${q(r.destination)}"\n`;
    }
    if (r.extensions.length)
      out += `extensions = [${r.extensions.map((e) => `"${q(e)}"`).join(", ")}]\n`;
    if (r.namePattern?.trim())
      out += `name_pattern = "${q(r.namePattern.trim())}"\n`;
    if (r.minSizeMb !== "") out += `min_size_mb = ${parseFloat(r.minSizeMb)}\n`;
    if (r.maxSizeMb !== "") out += `max_size_mb = ${parseFloat(r.maxSizeMb)}\n`;
    if (r.ignore?.length)
      out += `ignore = [${r.ignore.map((p) => `"${q(p)}"`).join(", ")}]\n`;
    out += "\n";
  }
  return out.trimEnd();
}

function buildToml() {
  return buildTomlFromData(
    tmplRecursive.checked,
    tmplIgnoreHidden.checked,
    tmplUnmatched.value,
    tmplDeleteEmptyDirs.checked,
    tmplKeepDirs,
    tmplRules,
  );
}

async function duplicateTmpl(name) {
  let info;
  try {
    info = await invoke("get_template_rules", {
      templateName: name,
    });
  } catch (err) {
    setTmplStatus(t("dupFailed", err), "err");
    return;
  }

  const existing = await invoke("list_templates");
  let newName = t("tmplCopy", name);
  let counter = 2;
  while (existing.includes(newName)) newName = t("tmplCopyN", name, counter++);

  const rules = info.rules.map((r) => ({
    name: r.name,
    destination: r.destination,
    delete: r.delete ?? false,
    extensions: [...r.extensions],
    namePattern: r.name_pattern ?? "",
    minSizeMb: r.min_size_mb != null ? String(r.min_size_mb) : "",
    maxSizeMb: r.max_size_mb != null ? String(r.max_size_mb) : "",
    ignore: [...(r.ignore ?? [])],
  }));

  const toml = buildTomlFromData(
    info.recursive,
    info.ignore_hidden,
    info.unmatched_destination ?? "",
    info.delete_empty_dirs ?? false,
    info.keep_dirs ?? [],
    rules,
  );
  try {
    await invoke("save_template_content", {
      templateName: newName,
      content: toml,
    });
    await loadTmplList(newName);
    await selectTemplate(newName);
  } catch (err) {
    setTmplStatus(t("dupFailed", err), "err");
  }
}

// ── Save ───────────────────────────────────────────────────────────────────
btnTmplSave.addEventListener("click", async () => {
  const name = tmplNameInput.value.trim();
  if (!name) {
    setTmplStatus(t("tmplNameRequired"), "err");
    tmplNameInput.focus();
    return;
  }

  // Validate rules
  for (let i = 0; i < tmplRules.length; i++) {
    const r = tmplRules[i];
    if (!r.name.trim()) {
      setTmplStatus(t("ruleNameRequired", i + 1), "err");
      return;
    }
    if (!r.delete && !r.destination.trim()) {
      setTmplStatus(t("ruleDstRequired", r.name), "err");
      return;
    }
    const hasCondition =
      r.extensions.length ||
      r.namePattern.trim() ||
      r.minSizeMb !== "" ||
      r.maxSizeMb !== "";
    if (!hasCondition) {
      setTmplStatus(t("ruleCondRequired", r.name), "err");
      return;
    }
  }

  if (tmplRules.length === 0) {
    setTmplStatus(t("addRuleFirst"), "err");
    return;
  }

  const toml = buildToml();
  btnTmplSave.disabled = true;

  try {
    await invoke("save_template_content", {
      templateName: name,
      content: toml,
    });

    // If renamed, delete old file
    if (tmplOriginalName !== null && tmplOriginalName !== name) {
      await invoke("delete_template", {
        templateName: tmplOriginalName,
      });
    }

    tmplOriginalName = name;
    setTmplDirty(false);
    setTmplStatus(t("savedOk"), "ok");
    await loadTmplList(name);
  } catch (err) {
    setTmplStatus(t("saveFailed", err), "err");
  } finally {
    btnTmplSave.disabled = false;
  }
});

// ── Auto-updater ────────────────────────────────────────────────
const updateBadge = document.getElementById("update-badge");

document.getElementById("btn-github").addEventListener("click", () => {
  invoke("open_url", { url: "https://github.com/rricol/drust-cleaner" });
});
let pendingUpdateVersion = null;

async function checkForUpdate() {
  try {
    const update = await invoke("check_update");
    if (update) {
      pendingUpdateVersion = update.version;
      updateBadge.title = t("updateVersionTitle", update.version);
      updateBadge.classList.add("visible");
    }
  } catch (_) {
    // Silently ignore — no network, no release yet, etc.
  }
}

updateBadge.addEventListener("click", async () => {
  if (!pendingUpdateVersion) return;
  updateBadge.textContent = t("updateInstalling");
  updateBadge.style.pointerEvents = "none";
  try {
    await invoke("install_update");
  } catch (e) {
    console.error("Update failed:", e);
    updateBadge.textContent = t("updateFailed");
    updateBadge.style.pointerEvents = "";
    updateBadge.title = t("updateFailedTitle", e);
    updateBadge.classList.add("error");
    setTimeout(() => {
      updateBadge.textContent = t("updateAvailable");
      updateBadge.classList.remove("error");
      updateBadge.title = t("updateVersionTitle", pendingUpdateVersion);
    }, 4000);
  }
});

// ── Settings & Theme ──────────────────────────────────────────────────
const settingsOverlay = document.getElementById("settings-overlay");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("drustTheme", theme);
  document
    .querySelectorAll(".theme-btn:not(.lang-btn)")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.theme === theme),
    );
}

function applyPalette(palette) {
  document.documentElement.dataset.palette = palette;
  localStorage.setItem("drustPalette", palette);
  document
    .querySelectorAll(".palette-btn")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.palette === palette),
    );
}

function applyAccent(accent) {
  document.documentElement.dataset.accent = accent;
  localStorage.setItem("drustAccent", accent);
  document
    .querySelectorAll(".accent-swatch")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.accent === accent),
    );
}

// Apply saved theme, palette, accent and language on startup
applyTheme(localStorage.getItem("drustTheme") || "dark");
applyPalette(localStorage.getItem("drustPalette") || "midnight");
applyAccent(localStorage.getItem("drustAccent") || "rose");
applyLang(localStorage.getItem("drustLang") || "en");

document
  .getElementById("btn-settings")
  .addEventListener("click", () => settingsOverlay.classList.add("visible"));
document
  .getElementById("settings-close")
  .addEventListener("click", () => settingsOverlay.classList.remove("visible"));
settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) settingsOverlay.classList.remove("visible");
});
document
  .querySelectorAll(".theme-btn:not(.lang-btn)")
  .forEach((btn) =>
    btn.addEventListener("click", () => applyTheme(btn.dataset.theme)),
  );
document
  .querySelectorAll(".palette-btn")
  .forEach((btn) =>
    btn.addEventListener("click", () => applyPalette(btn.dataset.palette)),
  );
document
  .querySelectorAll(".accent-swatch")
  .forEach((btn) =>
    btn.addEventListener("click", () => applyAccent(btn.dataset.accent)),
  );
document
  .querySelectorAll(".lang-btn")
  .forEach((btn) =>
    btn.addEventListener("click", () => applyLang(btn.dataset.lang)),
  );

// Load app version into footer
invoke("get_app_version").then((v) => {
  document.getElementById("app-version").textContent = `Drust Cleaner v${v}`;
});

// Check for update after a short delay to not block startup
setTimeout(checkForUpdate, 3000);

// Load favorites on startup
loadFavorites();

// ────────────────────────────────────────────────────────────────────────────
// HISTORY VIEW
// ────────────────────────────────────────────────────────────────────────────
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const btnClearHistory = document.getElementById("btn-clear-history");

function renderHistory(entries) {
  historyList.innerHTML = "";
  if (!entries || entries.length === 0) {
    historyList.style.display = "none";
    historyEmpty.style.display = "flex";
    return;
  }
  historyList.style.display = "flex";
  historyEmpty.style.display = "none";

  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "history-card" + (entry.undone ? " undone" : "");

    const date = new Date(Number(entry.id)).toLocaleString();
    const folder = baseName(entry.folder_path);

    const statsHtml = [
      entry.moved > 0
        ? `<span class="history-stat history-stat-moved">${entry.moved} ${t("moved")}</span>`
        : "",
      entry.deleted > 0
        ? `<span class="history-stat history-stat-deleted">${entry.deleted} ${t("deletedStat")}</span>`
        : "",
      entry.errors > 0
        ? `<span class="history-stat history-stat-error">${entry.errors} ${t("errors")}</span>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    card.innerHTML =
      `<div class="history-card-header">` +
        `<span class="history-date">${escHtml(date)}</span>` +
        `<span class="history-folder" title="${escHtml(entry.folder_path)}">${escHtml(folder)}</span>` +
        `<span class="history-template">${escHtml(entry.template_name)}</span>` +
        `<span class="history-stats">${statsHtml}</span>` +
      `</div>` +
      `<div class="history-log"></div>`;

    const header = card.querySelector(".history-card-header");

    if (entry.undone) {
      const badge = document.createElement("span");
      badge.className = "history-badge-undone";
      badge.textContent = t("undoneLabel");
      header.appendChild(badge);
    } else if (entry.moves && entry.moves.length > 0) {
      const btnUndo = document.createElement("button");
      btnUndo.className = "btn-undo";
      btnUndo.textContent = t("undoRun");
      btnUndo.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm(t("undoConfirm"))) return;
        try {
          await invoke("undo_run", { id: entry.id });
          loadHistory();
        } catch (err) {
          alert(err);
        }
      });
      header.appendChild(btnUndo);
    }

    const logDiv = card.querySelector(".history-log");
    header.addEventListener("click", () => {
      const expanded = card.classList.toggle("expanded");
      if (expanded && logDiv.childElementCount === 0) {
        entry.messages.forEach((msg) => logDiv.appendChild(buildLogEntry(msg)));
      }
    });

    historyList.appendChild(card);
  });
}

async function loadHistory() {
  const entries = await invoke("get_run_history");
  renderHistory(entries);
}

btnClearHistory.addEventListener("click", async () => {
  if (!confirm(t("clearHistoryConfirm"))) return;
  await invoke("clear_run_history");
  renderHistory([]);
});
