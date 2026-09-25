/* Som da Turma: ajuste numérico local do microfone.
 * Carregar depois de control-core.js e antes de profiles.js.
 * O fator altera os limites do medidor, não o ganho do Windows.
 */
(() => {
  'use strict';
  const STORAGE_KEY = 'som_turma_microphone_v1';
  const MIN = 0.01;
  const MAX = 20;
  const STEP = 0.01;
  // 1,00x mantém os limites do antigo padrão de 90%.
  const BASE = 1.65 - 0.90 * 1.35;
  const controls = [];
  let saved = null;
  let experienceSnapshot = null;

  function parse(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const text = String(value ?? '').trim().replace(',', '.');
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
    const n = Number(text);
    return Number.isFinite(n) ? n : null;
  }
  function clamp(n) {
    return Math.round(Math.max(MIN, Math.min(MAX, n)) * 100) / 100;
  }
  function format(n) { return n.toFixed(2).replace('.', ','); }
  function inExperience() {
    const note = document.querySelector('.experience-note');
    return !!note && !note.classList.contains('hidden');
  }
  function readSaved() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      const n = value && value.version === 1 ? parse(value.factor) : null;
      return n !== null && n >= MIN && n <= MAX ? clamp(n) : null;
    } catch (_) { return null; }
  }
  function status(message) {
    controls.forEach(control => { control.status.textContent = message; });
  }
  function remember() {
    if (inExperience()) {
      status('Somente neste teste • não salvo');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, factor: sensitivity }));
      saved = sensitivity;
      status('Salvo neste navegador');
    } catch (_) {
      status('Ajustado nesta sessão • não foi possível salvar');
    }
  }
  function render(source) {
    controls.forEach(control => {
      if (control.input !== source) control.input.value = format(sensitivity);
      control.input.setAttribute('aria-valuenow', String(sensitivity));
      control.input.setAttribute('aria-valuetext', format(sensitivity) + ' vezes');
      control.minus.disabled = sensitivity <= MIN;
      control.plus.disabled = sensitivity >= MAX;
    });
  }

  const legacy = parse(sensitivity);
  const initial = clamp(BASE / (1.65 - Math.max(0, Math.min(100, legacy ?? 90)) * 0.0135));
  saved = readSaved();
  // Estas funções são consultadas dinamicamente pela aula, pelo medidor e por OUVIR.
  setSensitivity = function (value, options = {}) {
    const parsed = parse(value);
    if (parsed === null) return false;
    sensitivity = clamp(parsed);
    render(options.source);
    if (options.persist !== false) remember();
    return true;
  };
  thresholds = function () {
    const factor = clamp(parse(sensitivity) ?? 1);
    return { quiet: 0.028 * BASE / factor, loud: 0.082 * BASE / factor };
  };

  const style = document.createElement('style');
  style.textContent = `
    .sensitivity.mic-adjust-control{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;gap:10px;align-items:stretch}
    .mic-adjust-control .mic-step{border:1px solid #cbd5e1;border-radius:14px;background:#e2e8f0;color:#0f172a;font-size:27px;font-weight:900;min-height:54px;padding:0;cursor:pointer}
    .mic-adjust-control .mic-step:hover:not(:disabled){background:#cbd5e1}
    .mic-adjust-control .mic-step:disabled{opacity:.4;cursor:default}
    .mic-adjust-value{display:flex;align-items:center;min-width:0;background:#fff;border:2px solid #cbd5e1;border-radius:14px;overflow:hidden}
    .mic-adjust-value:focus-within{outline:3px solid #93c5fd;border-color:#2563eb}
    .field .mic-adjust-control input{width:100%;min-width:0;padding:10px 3px 10px 14px;border:0;border-radius:0;background:transparent;font-size:28px;font-weight:900;text-align:center;font-variant-numeric:tabular-nums;color:#0f172a;box-shadow:none}
    .field .mic-adjust-control input:focus{outline:none;border:0}
    .mic-factor-unit{padding:0 12px 0 2px;color:#64748b;font-size:19px;flex-shrink:0}
    .mic-adjust-help{margin:6px 0 0;font-size:12px;line-height:1.45;font-weight:750;color:#475569;text-align:center}
    .mic-adjust-status{min-height:17px;font-size:11px;line-height:1.4;color:#64748b;text-align:center}
    .mic-adjust-control button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}
    @media(max-width:380px){.sensitivity.mic-adjust-control{grid-template-columns:42px minmax(0,1fr) 42px;gap:7px}.field .mic-adjust-control input{font-size:24px}}
  `;
  document.head.appendChild(style);

  ['sensitivity', 'sensitivityLive'].forEach(id => {
    const input = document.getElementById(id);
    const row = input?.closest('.sensitivity');
    const field = input?.closest('.field');
    if (!input || !row || !field) return;
    // Texto com semântica numérica aceita tanto vírgula quanto ponto decimal.
    input.type = 'text';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.maxLength = 10;
    ['min', 'max', 'step'].forEach(attr => input.removeAttribute(attr));
    input.setAttribute('role', 'spinbutton');
    input.setAttribute('aria-label', 'Sensibilidade do medidor. Menor número reduz a sensibilidade.');
    input.setAttribute('aria-valuemin', String(MIN));
    input.setAttribute('aria-valuemax', String(MAX));
    input.setAttribute('aria-describedby', id + 'Help ' + id + 'Status');

    const value = document.createElement('div');
    value.className = 'mic-adjust-value';
    const unit = document.createElement('span');
    unit.className = 'mic-factor-unit';
    unit.textContent = '×';
    unit.setAttribute('aria-hidden', 'true');
    value.append(input, unit);
    const minus = document.createElement('button');
    const plus = document.createElement('button');
    [minus, plus].forEach(button => { button.type = 'button'; button.className = 'mic-step'; });
    minus.textContent = '−';
    plus.textContent = '+';
    minus.setAttribute('aria-label', 'Diminuir a sensibilidade em 0,01');
    plus.setAttribute('aria-label', 'Aumentar a sensibilidade em 0,01');
    row.classList.add('mic-adjust-control');
    row.replaceChildren(minus, value, plus);

    const help = document.createElement('p');
    help.id = id + 'Help';
    help.className = 'mic-adjust-help';
    help.textContent = 'Menor = menos sensível • Maior = mais sensível';
    const note = document.createElement('div');
    note.id = id + 'Status';
    note.className = 'mic-adjust-status';
    note.setAttribute('aria-live', 'polite');
    row.after(help, note);
    controls.push({ input, minus, plus, status: note });

    function commit() {
      const n = parse(input.value);
      if (n === null) {
        render();
        status('Valor mantido • use um número de 0,01 a 20,00');
      } else {
        setSensitivity(n);
        if (n < MIN || n > MAX) status('Ajuste permitido: de 0,01 a 20,00');
      }
    }
    input.oninput = () => {
      const n = parse(input.value);
      // Não aplicar zeros ou campos incompletos enquanto a pessoa digita 0,10.
      if (n !== null && n >= MIN && n <= MAX) setSensitivity(n, { source: input });
    };
    input.onchange = commit;
    input.onblur = commit;
    input.onkeydown = event => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const direction = event.key === 'ArrowUp' ? 1 : -1;
        setSensitivity(sensitivity + direction * STEP);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        commit();
      } else if (event.key === 'Escape') {
        render();
      }
    };
    minus.onclick = () => setSensitivity(sensitivity - STEP);
    plus.onclick = () => setSensitivity(sensitivity + STEP);
  });

  setSensitivity(saved ?? initial, { persist: false });
  status(saved !== null ? 'Salvo neste navegador' : 'Ajuste deste navegador • padrão 1,00×');

  // O modo experiência permite testar valores sem gravá-los. Ao sair, restaura o ajuste.
  function watchExperience() {
    const note = document.querySelector('.experience-note');
    if (!note) return false;
    let wasExperience = inExperience();
    if (wasExperience) experienceSnapshot = sensitivity;
    new MutationObserver(() => {
      const isExperience = inExperience();
      if (isExperience === wasExperience) return;
      wasExperience = isExperience;
      if (isExperience) {
        experienceSnapshot = sensitivity;
        status('Somente neste teste • não salvo');
      } else {
        setSensitivity(readSaved() ?? experienceSnapshot ?? initial, { persist: false });
        status(readSaved() !== null ? 'Salvo neste navegador' : 'Ajuste deste navegador • padrão 1,00×');
        experienceSnapshot = null;
      }
    }).observe(note, { attributes: true, attributeFilter: ['class'] });
    return true;
  }
  if (!watchExperience()) {
    const observer = new MutationObserver(() => { if (watchExperience()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  window.SOM_TURMA_MIC_CONTROL_VERSION = '20260925-1';
})();
