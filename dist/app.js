            const { invoke } = window.__TAURI__.core;
            const { open } = window.__TAURI__.dialog;

            // ── i18n ─────────────────────────────────────────────────────────────────
            const TRANSLATIONS = {
                en: {
                    tabCleaner:"Cleaner", tabTemplates:"Templates",
                    targetFolder:"Target Folder", noFolderSelected:"No folder selected…",
                    chooseFolder:"Choose Folder", changeFolder:"Change folder", openInFinder:"Open in Finder",
                    configuration:"Configuration", selectTemplate:"Select a template…",
                    noTemplates:"No templates — create one in the Templates tab.",
                    linkTemplate:"Link template", linkedTemplate:"Linked template:",
                    change:"Change", unlink:"Unlink", dryRun:"Dry Run", runNow:"Run Now",
                    output:"Output", moved:"moved", errors:"errors",
                    templates:"Templates", newTemplate:"+ New Template",
                    templatePlaceholder:"Select a template or create a new one.",
                    templateNamePh:"Template name…", unsavedChanges:"Unsaved changes",
                    save:"Save", settingsCard:"Settings", recursive:"Recursive (scan sub-folders)",
                    unmatchedFiles:"Unmatched files →", unmatchedPh:"(none)",
                    unmatchedTip:'Files that don\'t match any rule are normally left untouched. Set a folder name here (e.g. "Other") and they will be moved there instead, leaving the target folder fully clean.',
                    rules:"Rules", addRule:"+ Add Rule",
                    ruleNamePh:"Rule name…", ruleDstPh:"Destination folder…",
                    removeRule:"Remove rule", moveUp:"Move up", moveDown:"Move down",
                    extensions:"Extensions", exclude:"Exclude",
                    optionalFilters:"Optional filters", namePattern:"Name pattern",
                    namePatternPh:"e.g. *.log", minSize:"Min size (MB)", maxSize:"Max size (MB)",
                    extPh:"jpg, png, pdf…", excludePh:"*.tmp, secret.txt…",
                    settingsTitle:"Settings", theme:"Theme",
                    dark:"Dark", light:"Light", system:"System",
                    language:"Language", updates:"Updates",
                    betaChannel:"Beta channel", betaChannelSub:"Receive pre-release updates", soon:"soon",
                    updateAvailable:"⬆ Update available", updateAvailableTitle:"Click to install update",
                    updateInstalling:"⬇ Installing…", updateFailed:"⚠ Update failed",
                    updateFailedTitle:"Click to retry — Error: {0}",
                    updateVersionTitle:"v{0} available — click to install",
                    startingDryRun:"Starting dry run…", startingRun:"Starting run…",
                    runBadgeDry:"Dry Run", runBadgeRun:"Run",
                    failedToLink:"Failed to link template: {0}",
                    failedToUnlink:"Failed to unlink: {0}",
                    failedToChange:"Failed to change template: {0}",
                    failedToOpen:"Failed to open folder: {0}",
                    doneWithErrors:"Done with errors — {0} error(s).",
                    runFailed:"Run failed: {0}", errorLog:"ERROR: {0}",
                    loading:"Loading…", failedToLoad:"Failed to load: {0}",
                    noTemplatesYet:"No templates yet",
                    failedToLoadTmpl:"Failed to load template: {0}",
                    deleteFailed:"Delete failed: {0}", dupFailed:"Failed to duplicate: {0}",
                    tmplCopy:"{0} copy", tmplCopyN:"{0} copy {1}",
                    tmplNameRequired:"Template name is required.",
                    ruleNameRequired:"Rule {0}: name is required.",
                    ruleDstRequired:"Rule \"{0}\": destination is required.",
                    ruleCondRequired:"Rule \"{0}\": at least one condition is required (extension, pattern or size).",
                    addRuleFirst:"Add at least one rule before saving.",
                    savedOk:"Saved successfully.", saveFailed:"Save failed: {0}",
                    rulesModal:"Rules — {0}",
                    ruleCount:"{0} Rule", ruleCountPlural:"{0} Rules",
                },
                fr: {
                    tabCleaner:"Nettoyeur", tabTemplates:"Modèles",
                    targetFolder:"Dossier cible", noFolderSelected:"Aucun dossier sélectionné…",
                    chooseFolder:"Choisir un dossier", changeFolder:"Changer de dossier", openInFinder:"Ouvrir dans le Finder",
                    configuration:"Configuration", selectTemplate:"Sélectionner un modèle…",
                    noTemplates:"Aucun modèle — créez-en un dans l'onglet Modèles.",
                    linkTemplate:"Lier le modèle", linkedTemplate:"Modèle lié :",
                    change:"Changer", unlink:"Délier", dryRun:"Simulation", runNow:"Exécuter",
                    output:"Résultats", moved:"déplacés", errors:"erreurs",
                    templates:"Modèles", newTemplate:"+ Nouveau modèle",
                    templatePlaceholder:"Sélectionnez un modèle ou créez-en un.",
                    templateNamePh:"Nom du modèle…", unsavedChanges:"Modifications non sauvegardées",
                    save:"Sauvegarder", settingsCard:"Paramètres", recursive:"Récursif (inclure les sous-dossiers)",
                    unmatchedFiles:"Fichiers non classés →", unmatchedPh:"(aucun)",
                    unmatchedTip:'Les fichiers ne correspondant à aucune règle sont normalement laissés intacts. Saisissez un nom de dossier ici (ex. "Autres") et ils y seront déplacés, laissant le dossier cible entièrement propre.',
                    rules:"Règles", addRule:"+ Ajouter une règle",
                    ruleNamePh:"Nom de la règle…", ruleDstPh:"Dossier de destination…",
                    removeRule:"Supprimer la règle", moveUp:"Monter", moveDown:"Descendre",
                    extensions:"Extensions", exclude:"Exclure",
                    optionalFilters:"Filtres optionnels", namePattern:"Motif de nom",
                    namePatternPh:"ex. *.log", minSize:"Taille min (Mo)", maxSize:"Taille max (Mo)",
                    extPh:"jpg, png, pdf…", excludePh:"*.tmp, secret.txt…",
                    settingsTitle:"Paramètres", theme:"Thème",
                    dark:"Sombre", light:"Clair", system:"Système",
                    language:"Langue", updates:"Mises à jour",
                    betaChannel:"Canal bêta", betaChannelSub:"Recevoir les mises à jour bêta", soon:"bientôt",
                    updateAvailable:"⬆ Mise à jour disponible", updateAvailableTitle:"Cliquer pour installer",
                    updateInstalling:"⬇ Installation…", updateFailed:"⚠ Mise à jour échouée",
                    updateFailedTitle:"Cliquer pour réessayer — Erreur : {0}",
                    updateVersionTitle:"v{0} disponible — cliquer pour installer",
                    startingDryRun:"Démarrage de la simulation…", startingRun:"Démarrage…",
                    runBadgeDry:"Simulation", runBadgeRun:"Exécution",
                    failedToLink:"Échec de la liaison : {0}",
                    failedToUnlink:"Échec de la dissociation : {0}",
                    failedToChange:"Échec du changement : {0}",
                    failedToOpen:"Impossible d'ouvrir le dossier : {0}",
                    doneWithErrors:"Terminé avec des erreurs — {0} erreur(s).",
                    runFailed:"Échec de l'exécution : {0}", errorLog:"ERREUR : {0}",
                    loading:"Chargement…", failedToLoad:"Échec du chargement : {0}",
                    noTemplatesYet:"Aucun modèle",
                    failedToLoadTmpl:"Échec du chargement du modèle : {0}",
                    deleteFailed:"Échec de la suppression : {0}", dupFailed:"Échec de la duplication : {0}",
                    tmplCopy:"{0} copie", tmplCopyN:"{0} copie {1}",
                    tmplNameRequired:"Le nom du modèle est requis.",
                    ruleNameRequired:"Règle {0} : le nom est requis.",
                    ruleDstRequired:"Règle « {0} » : la destination est requise.",
                    ruleCondRequired:"Règle « {0} » : au moins une condition est requise (extension, motif ou taille).",
                    addRuleFirst:"Ajoutez au moins une règle avant de sauvegarder.",
                    savedOk:"Sauvegardé avec succès.", saveFailed:"Échec de la sauvegarde : {0}",
                    rulesModal:"Règles — {0}",
                    ruleCount:"{0} Règle", ruleCountPlural:"{0} Règles",
                },
            };

            let currentLang = "en";

            function t(key, ...args) {
                const str = (TRANSLATIONS[currentLang] ?? TRANSLATIONS.en)[key] ?? TRANSLATIONS.en[key] ?? key;
                return str.replace(/\{(\d+)\}/g, (_, i) => args[Number(i)] ?? "");
            }

            function applyLang(lang) {
                currentLang = lang;
                localStorage.setItem("drustLang", lang);
                document.documentElement.lang = lang;
                document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
                document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
                document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
                document.querySelectorAll("[data-i18n-tip]").forEach((el) => { el.dataset.tip = t(el.dataset.i18nTip); });
                document.querySelectorAll(".lang-btn").forEach((btn) =>
                    btn.classList.toggle("active", btn.dataset.lang === lang)
                );
                // Update dynamic elements
                if (!currentFolder) document.getElementById("folder-path").textContent = t("noFolderSelected");
                if (!linkedTemplate) document.getElementById("config-btn-label").textContent = t("selectTemplate");
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
                    if (view === "templates") loadTmplList();
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
            const statErrors = document.getElementById("stat-errors");

            let linkedTemplate = null;   // String | null — persisted association
            let selectedTemplate = null; // String | null — dropdown selection (unlinked state)

            function setConfigStatus(msg, type) {
                const el = document.getElementById("config-status");
                el.textContent = msg;
                el.className = "config-status-line" + (type ? ` ${type}` : "");
            }

            function clearLog() {
                logOutput.textContent = "";
                logCard.classList.remove("visible");
                logSummary.style.display = "none";
            }

            function appendLog(msg) {
                const span = document.createElement("span");
                span.className = "log-line " + classifyMsg(msg);
                span.textContent = msg;
                logOutput.appendChild(span);
                logOutput.appendChild(document.createTextNode("\n"));
                logOutput.scrollTop = logOutput.scrollHeight;
            }

            function classifyMsg(msg) {
                if (msg.startsWith("[DRY-RUN]")) return "log-dryrun";
                if (msg.startsWith("MOVED")) return "log-moved";
                if (msg.startsWith("ERROR")) return "log-error";
                if (msg.includes("WARN")) return "log-warn";
                return "log-default";
            }

            // ── Config card (folder-template binding) ────────────────────────────────
            const cfgSelectBtn = document.getElementById("config-select-btn");
            const cfgDropdownMenu = document.getElementById("config-dropdown-menu");
            const cfgBtnLabel = document.getElementById("config-btn-label");
            const cfgTemplateOpts = document.getElementById("cfg-template-opts");
            const cfgNoTemplates = document.getElementById("cfg-no-templates");
            const cfgUnlinked = document.getElementById("cfg-unlinked");
            const cfgLinked = document.getElementById("cfg-linked");
            const cfgLinkedName = document.getElementById("cfg-linked-name");
            const btnLinkTmpl = document.getElementById("btn-link-tmpl");
            const btnChangeTmpl = document.getElementById("btn-change-tmpl");
            const btnUnlinkTmpl = document.getElementById("btn-unlink-tmpl");
            const btnDryRun = document.getElementById("btn-dry-run");
            const btnRunNow = document.getElementById("btn-run-now");

            cfgSelectBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const isOpen = cfgDropdownMenu.style.display !== "none";
                cfgDropdownMenu.style.display = isOpen ? "none" : "";
                cfgSelectBtn.classList.toggle("open", !isOpen);
            });

            document.addEventListener("click", () => {
                cfgDropdownMenu.style.display = "none";
                cfgSelectBtn.classList.remove("open");
            });

            cfgDropdownMenu.addEventListener("click", (e) => e.stopPropagation());

            async function loadTemplateDropdown() {
                const names = await invoke("list_templates");
                cfgTemplateOpts.innerHTML = "";
                selectedTemplate = null;
                cfgBtnLabel.textContent = "Select a template…";
                btnLinkTmpl.disabled = true;

                if (names.length === 0) {
                    cfgNoTemplates.style.display = "";
                } else {
                    cfgNoTemplates.style.display = "none";
                    for (const name of names) {
                        const opt = document.createElement("div");
                        opt.className = "config-opt";
                        opt.dataset.value = name;
                        opt.textContent = name;
                        opt.addEventListener("click", () => {
                            selectedTemplate = name;
                            cfgBtnLabel.textContent = name;
                            cfgTemplateOpts.querySelectorAll(".config-opt").forEach((o) =>
                                o.classList.toggle("selected", o.dataset.value === name)
                            );
                            btnLinkTmpl.disabled = false;
                            cfgDropdownMenu.style.display = "none";
                            cfgSelectBtn.classList.remove("open");
                        });
                        cfgTemplateOpts.appendChild(opt);
                    }
                }
            }

            async function loadFolderAssociation() {
                linkedTemplate = await invoke("get_folder_association", { folderPath: currentFolder });
                renderConfigCard();
            }

            function renderConfigCard() {
                if (linkedTemplate !== null) {
                    cfgUnlinked.style.display = "none";
                    cfgLinked.style.display = "";
                    cfgLinkedName.textContent = linkedTemplate;
                } else {
                    cfgLinked.style.display = "none";
                    cfgUnlinked.style.display = "";
                }
                setConfigStatus("");
            }

            btnLinkTmpl.addEventListener("click", async () => {
                if (!selectedTemplate || !currentFolder) return;
                btnLinkTmpl.disabled = true;
                try {
                    await invoke("set_folder_association", {
                        folderPath: currentFolder,
                        templateName: selectedTemplate,
                    });
                    linkedTemplate = selectedTemplate;
                    renderConfigCard();
                } catch (e) {
                    setConfigStatus(t("failedToLink", e), "err");
                    btnLinkTmpl.disabled = false;
                }
            });

            btnUnlinkTmpl.addEventListener("click", async () => {
                if (!currentFolder) return;
                try {
                    await invoke("remove_folder_association", { folderPath: currentFolder });
                    linkedTemplate = null;
                    renderConfigCard();
                    await loadTemplateDropdown();
                } catch (e) {
                    setConfigStatus(t("failedToUnlink", e), "err");
                }
            });

            btnChangeTmpl.addEventListener("click", async () => {
                if (!currentFolder) return;
                try {
                    await invoke("remove_folder_association", { folderPath: currentFolder });
                    linkedTemplate = null;
                    renderConfigCard();
                    await loadTemplateDropdown();
                } catch (e) {
                    setConfigStatus(t("failedToChange", e), "err");
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
            const btnChangeFolder =
                document.getElementById("btn-change-folder");
            const btnOpenFolder = document.getElementById("btn-open-folder");

            async function pickFolder() {
                const path = await open({ directory: true, multiple: false });
                if (!path) return;

                currentFolder = path;
                folderPathEl.textContent = path;
                folderPathEl.classList.add("has-value");
                btnPick.style.display = "none";
                btnChangeFolder.classList.add("visible");
                btnOpenFolder.classList.add("visible");
                clearLog();
                setConfigStatus("");
                document.getElementById("config-card").style.display = "block";
                await loadTemplateDropdown();
                await loadFolderAssociation();
            }

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
                if (!currentFolder || !linkedTemplate) return;
                [btnDryRun, btnRunNow].forEach((b) => (b.disabled = true));
                clearLog();
                logCard.classList.add("visible");
                appendLog(dryRun ? t("startingDryRun") : t("startingRun"));
                try {
                    const result = await invoke("run_with_template", {
                        folderPath: currentFolder,
                        templateName: linkedTemplate,
                        dryRun,
                    });
                    for (const msg of result.messages) appendLog(msg);
                    statMoved.textContent = result.moved;
                    statErrors.textContent = result.errors;
                    const hasErr = result.errors > 0;
                    logRunBadge.textContent = dryRun ? t("runBadgeDry") : t("runBadgeRun");
                    logRunBadge.className = "run-badge " + (dryRun ? "dry" : hasErr ? "err" : "run");
                    logSummary.style.display = "flex";
                    if (hasErr && !dryRun) {
                        setConfigStatus(t("doneWithErrors", result.errors), "err");
                    } else {
                        setConfigStatus("", "");
                    }
                } catch (e) {
                    appendLog(t("errorLog", e));
                    setConfigStatus(t("runFailed", e), "err");
                } finally {
                    [btnDryRun, btnRunNow].forEach((b) => (b.disabled = false));
                }
            }

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
                    ...(info.unmatched_destination
                        ? [
                              `<span class="modal-tag on">unmatched → ${escHtml(info.unmatched_destination)}</span>`,
                          ]
                        : []),
                ];
                const rulesHtml = info.rules
                    .map((r) => {
                        const exts = r.extensions
                            .map(
                                (e) =>
                                    `<span class="ext-chip">.${escHtml(e)}</span>`,
                            )
                            .join("");
                        const meta = [];
                        if (r.name_pattern)
                            meta.push(
                                `pattern: <code>${escHtml(r.name_pattern)}</code>`,
                            );
                        if (r.min_size_mb != null)
                            meta.push(`min ${r.min_size_mb} MB`);
                        if (r.max_size_mb != null)
                            meta.push(`max ${r.max_size_mb} MB`);
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

            // ── State ──────────────────────────────────────────────────────────────────
            let tmplOriginalName = null; // null = new unsaved template
            let tmplRules = []; // [{name, destination, extensions, namePattern, minSizeMb, maxSizeMb}]
            let tmplDirty = false;

            const tmplSidebarList =
                document.getElementById("tmpl-sidebar-list");
            const tmplPlaceholder = document.getElementById("tmpl-placeholder");
            const tmplForm = document.getElementById("tmpl-form");
            const tmplNameInput = document.getElementById("tmpl-name-input");
            const tmplDirtyDot = document.getElementById("tmpl-dirty-dot");
            const tmplRecursive = document.getElementById("tmpl-recursive");
            const tmplUnmatched = document.getElementById("tmpl-unmatched");
            const tmplRulesList = document.getElementById("tmpl-rules-list");
            const tmplStatusEl = document.getElementById("tmpl-status");
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
                    item.querySelector(".tmpl-sidebar-dupe").addEventListener(
                        "click",
                        async (e) => {
                            e.stopPropagation();
                            await duplicateTmpl(name);
                        },
                    );
                    item.querySelector(".tmpl-sidebar-delete").addEventListener(
                        "click",
                        async (e) => {
                            e.stopPropagation();
                            await deleteTmpl(name);
                        },
                    );
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
                tmplSidebarList
                    .querySelectorAll(".tmpl-sidebar-item")
                    .forEach((el) => {
                        el.classList.toggle("active", el.dataset.name === name);
                    });
            }

            // ── Select / load template ─────────────────────────────────────────────────
            async function selectTemplate(name) {
                highlightSidebarItem(name);
                tmplPlaceholder.style.display = "none";
                tmplForm.classList.add("visible");
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
                tmplUnmatched.value = info.unmatched_destination ?? "";
                tmplRules = info.rules.map((r) => ({
                    name: r.name,
                    destination: r.destination,
                    extensions: [...r.extensions],
                    namePattern: r.name_pattern ?? "",
                    minSizeMb:
                        r.min_size_mb != null ? String(r.min_size_mb) : "",
                    maxSizeMb:
                        r.max_size_mb != null ? String(r.max_size_mb) : "",
                    ignore: [...(r.ignore ?? [])],
                }));

                renderRules();
                setTmplDirty(false);
            }

            // ── New template ───────────────────────────────────────────────────────────
            btnNewTemplate.addEventListener("click", () => {
                highlightSidebarItem(null);
                tmplPlaceholder.style.display = "none";
                tmplForm.classList.add("visible");
                tmplOriginalName = null;
                tmplNameInput.value = "";
                tmplRecursive.checked = false;
                tmplUnmatched.value = "";
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

            // ── Rules rendering ────────────────────────────────────────────────────────
            function renderRules() {
                tmplRulesList.innerHTML = "";
                tmplRules.forEach((rule, idx) => {
                    tmplRulesList.appendChild(buildRuleCard(rule, idx));
                });
            }

            function buildRuleCard(rule, idx) {
                const card = document.createElement("div");
                card.className = "rule-editor-card";

                card.innerHTML = `
      <div class="rule-card-header">
        <div class="rule-order-btns">
          <button class="rule-order-btn" data-dir="up"   title="${t("moveUp")}"   ${idx === 0 ? "disabled" : ""}></button>
          <button class="rule-order-btn" data-dir="down" title="${t("moveDown")}" ${idx === tmplRules.length - 1 ? "disabled" : ""}></button>
        </div>
        <input type="text" class="rule-name-inp" placeholder="${t("ruleNamePh")}" value="${escAttr(rule.name)}" />
        <span class="rule-arrow">→</span>
        <input type="text" class="rule-dest-inp" placeholder="${t("ruleDstPh")}" value="${escAttr(rule.destination)}" style="flex:1.2" />
        <button class="rule-delete-btn" title="${t("removeRule")}">×</button>
      </div>
      <div class="rule-card-body">
        <div class="rule-field-row">
          <span class="rule-field-label">${t("extensions")}</span>
          <div class="ext-input-wrap" data-idx="${idx}"></div>
        </div>
        <div class="rule-field-row">
          <span class="rule-field-label">${t("exclude")}</span>
          <div class="ext-input-wrap ignore-input-wrap" data-idx="${idx}"></div>
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
      </div>
    `;

                // Extension chip input
                const extWrap = card.querySelector(".ext-input-wrap");
                buildExtChips(extWrap, rule.extensions, idx);

                // Ignore chip input
                const ignoreWrap = card.querySelector(".ignore-input-wrap");
                buildIgnoreChips(ignoreWrap, rule.ignore, idx);

                // Field bindings
                card.querySelector(".rule-name-inp").addEventListener(
                    "input",
                    (e) => {
                        tmplRules[idx].name = e.target.value;
                        setTmplDirty(true);
                    },
                );
                card.querySelector(".rule-dest-inp").addEventListener(
                    "input",
                    (e) => {
                        tmplRules[idx].destination = e.target.value;
                        setTmplDirty(true);
                    },
                );
                card.querySelector(".rule-pattern-inp").addEventListener(
                    "input",
                    (e) => {
                        tmplRules[idx].namePattern = e.target.value;
                        setTmplDirty(true);
                    },
                );
                card.querySelector(".rule-min-inp").addEventListener(
                    "input",
                    (e) => {
                        tmplRules[idx].minSizeMb = e.target.value;
                        setTmplDirty(true);
                    },
                );
                card.querySelector(".rule-max-inp").addEventListener(
                    "input",
                    (e) => {
                        tmplRules[idx].maxSizeMb = e.target.value;
                        setTmplDirty(true);
                    },
                );

                // Delete rule
                card.querySelector(".rule-delete-btn").addEventListener(
                    "click",
                    () => {
                        tmplRules.splice(idx, 1);
                        renderRules();
                        setTmplDirty(true);
                    },
                );

                // Up / down reorder
                card.querySelectorAll(".rule-order-btn").forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const dir = btn.dataset.dir;
                        const swap = dir === "up" ? idx - 1 : idx + 1;
                        if (swap < 0 || swap >= tmplRules.length) return;
                        [tmplRules[idx], tmplRules[swap]] = [
                            tmplRules[swap],
                            tmplRules[idx],
                        ];
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
                        renderRules();
                        // Refocus last ext chip's input
                        const newWrap =
                            tmplRulesList.querySelectorAll(".ext-input-wrap")[
                                idx
                            ];
                        if (newWrap)
                            newWrap.querySelector(".ext-text-input")?.focus();
                        setTmplDirty(true);
                    }
                });

                textInput.addEventListener("blur", () => {
                    if (textInput.value.trim())
                        addExt(textInput.value, idx, wrap, textInput);
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
                chip.querySelector(".ext-chip-remove").addEventListener(
                    "click",
                    () => {
                        tmplRules[idx].extensions = tmplRules[
                            idx
                        ].extensions.filter((e) => e !== ext);
                        renderRules();
                        // Re-focus the text input of the same card
                        const newWrap =
                            tmplRulesList.querySelectorAll(".ext-input-wrap")[
                                idx
                            ];
                        if (newWrap)
                            newWrap.querySelector(".ext-text-input")?.focus();
                        setTmplDirty(true);
                    },
                );
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
                    if (
                        (e.key === "Enter" || e.key === ",") &&
                        textInput.value.trim()
                    ) {
                        e.preventDefault();
                        addIgnorePattern(textInput.value, idx, wrap, textInput);
                    } else if (
                        e.key === "Backspace" &&
                        !textInput.value &&
                        tmplRules[idx].ignore.length
                    ) {
                        tmplRules[idx].ignore.pop();
                        renderRules();
                        const newWrap =
                            tmplRulesList.querySelectorAll(
                                ".ignore-input-wrap",
                            )[idx];
                        if (newWrap)
                            newWrap.querySelector(".ext-text-input")?.focus();
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
                chip.querySelector(".ext-chip-remove").addEventListener(
                    "click",
                    () => {
                        tmplRules[idx].ignore = tmplRules[idx].ignore.filter(
                            (p) => p !== pattern,
                        );
                        renderRules();
                        const newWrap =
                            tmplRulesList.querySelectorAll(
                                ".ignore-input-wrap",
                            )[idx];
                        if (newWrap)
                            newWrap.querySelector(".ext-text-input")?.focus();
                        setTmplDirty(true);
                    },
                );
                return chip;
            }

            // ── Add rule ───────────────────────────────────────────────────────────────
            btnAddRule.addEventListener("click", () => {
                tmplRules.push({
                    name: "",
                    destination: "",
                    extensions: [],
                    namePattern: "",
                    minSizeMb: "",
                    maxSizeMb: "",
                    ignore: [],
                });
                renderRules();
                setTmplDirty(true);
                // Focus new rule's name input
                const cards = tmplRulesList.querySelectorAll(".rule-name-inp");
                cards[cards.length - 1]?.focus();
            });

            // ── Delete template ────────────────────────────────────────────────────────
            async function deleteTmpl(name) {
                try {
                    await invoke("delete_template", { templateName: name });
                    if (tmplOriginalName === name) {
                        tmplOriginalName = null;
                        tmplForm.classList.remove("visible");
                        tmplPlaceholder.style.display = "";
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

            function buildTomlFromData(recursive, unmatched, rules) {
                let out = "[settings]\n";
                out += `recursive = ${recursive}\n`;
                if (unmatched.trim())
                    out += `unmatched_destination = "${q(unmatched.trim())}"\n`;
                out += "\n";
                for (const r of rules) {
                    out += "[[rules]]\n";
                    out += `name = "${q(r.name)}"\n`;
                    out += `destination = "${q(r.destination)}"\n`;
                    if (r.extensions.length)
                        out += `extensions = [${r.extensions.map((e) => `"${q(e)}"`).join(", ")}]\n`;
                    if (r.namePattern?.trim())
                        out += `name_pattern = "${q(r.namePattern.trim())}"\n`;
                    if (r.minSizeMb !== "")
                        out += `min_size_mb = ${parseFloat(r.minSizeMb)}\n`;
                    if (r.maxSizeMb !== "")
                        out += `max_size_mb = ${parseFloat(r.maxSizeMb)}\n`;
                    if (r.ignore?.length)
                        out += `ignore = [${r.ignore.map((p) => `"${q(p)}"`).join(", ")}]\n`;
                    out += "\n";
                }
                return out.trimEnd();
            }

            function buildToml() {
                return buildTomlFromData(
                    tmplRecursive.checked,
                    tmplUnmatched.value,
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
                while (existing.includes(newName))
                    newName = t("tmplCopyN", name, counter++);

                const rules = info.rules.map((r) => ({
                    name: r.name,
                    destination: r.destination,
                    extensions: [...r.extensions],
                    namePattern: r.name_pattern ?? "",
                    minSizeMb:
                        r.min_size_mb != null ? String(r.min_size_mb) : "",
                    maxSizeMb:
                        r.max_size_mb != null ? String(r.max_size_mb) : "",
                    ignore: [...(r.ignore ?? [])],
                }));

                const toml = buildTomlFromData(
                    info.recursive,
                    info.unmatched_destination ?? "",
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
                        setTmplStatus(
                            t("ruleNameRequired", i + 1),
                            "err",
                        );
                        return;
                    }
                    if (!r.destination.trim()) {
                        setTmplStatus(
                            t("ruleDstRequired", r.name),
                            "err",
                        );
                        return;
                    }
                    const hasCondition =
                        r.extensions.length ||
                        r.namePattern.trim() ||
                        r.minSizeMb !== "" ||
                        r.maxSizeMb !== "";
                    if (!hasCondition) {
                        setTmplStatus(
                            t("ruleCondRequired", r.name),
                            "err",
                        );
                        return;
                    }
                }

                if (tmplRules.length === 0) {
                    setTmplStatus(
                        t("addRuleFirst"),
                        "err",
                    );
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
                    if (
                        tmplOriginalName !== null &&
                        tmplOriginalName !== name
                    ) {
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
                document.querySelectorAll(".theme-btn:not(.lang-btn)").forEach((btn) =>
                    btn.classList.toggle("active", btn.dataset.theme === theme)
                );
            }

            // Apply saved theme and language on startup
            applyTheme(localStorage.getItem("drustTheme") || "dark");
            applyLang(localStorage.getItem("drustLang") || "en");

            document.getElementById("btn-settings").addEventListener("click", () =>
                settingsOverlay.classList.add("visible")
            );
            document.getElementById("settings-close").addEventListener("click", () =>
                settingsOverlay.classList.remove("visible")
            );
            settingsOverlay.addEventListener("click", (e) => {
                if (e.target === settingsOverlay) settingsOverlay.classList.remove("visible");
            });
            document.querySelectorAll(".theme-btn:not(.lang-btn)").forEach((btn) =>
                btn.addEventListener("click", () => applyTheme(btn.dataset.theme))
            );
            document.querySelectorAll(".lang-btn").forEach((btn) =>
                btn.addEventListener("click", () => applyLang(btn.dataset.lang))
            );

            // Load app version into footer
            invoke("get_app_version").then((v) => {
                document.getElementById("app-version").textContent = `Drust Cleaner v${v}`;
            });

            // Check for update after a short delay to not block startup
            setTimeout(checkForUpdate, 3000);
