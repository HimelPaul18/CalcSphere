
/* ============================================================
   CalcSphere — script.js
   Navigation + Basic + BMI + Age + Loan Calculators
   ============================================================ */
 
/* ─────────────────────────────────────
   NAVIGATION
───────────────────────────────────── */
 
const SCREENS = ['homeScreen', 'calcBasic', 'calcBmi', 'calcAge', 'calcLoan'];
 
function showHome(e) {
  if (e) e.preventDefault();
  SCREENS.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active');
    el.style.display = 'none';
  });
 
  const home = document.getElementById('homeScreen');
  home.style.display = 'block';
  requestAnimationFrame(() => home.classList.add('active'));
 
  document.getElementById('navHome').classList.add('active');
  document.getElementById('navBack').classList.add('hidden');
 
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
 
function showCalc(type) {
  const idMap = {
    basic: 'calcBasic',
    bmi:   'calcBmi',
    age:   'calcAge',
    loan:  'calcLoan'
  };
 
  SCREENS.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active');
    el.style.display = 'none';
  });
 
  const target = document.getElementById(idMap[type]);
  target.style.display = 'block';
  requestAnimationFrame(() => target.classList.add('active'));
 
  document.getElementById('navHome').classList.remove('active');
  document.getElementById('navBack').classList.remove('hidden');
 
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
 
// Keyboard: Enter / Space activates cards
document.addEventListener('keydown', (e) => {
  const card = e.target.closest('.calc-card');
  if (card && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    card.click();
  }
});
 
// ─────────────────────────────────────
// BASIC CALCULATOR
// ─────────────────────────────────────
let bExpr     = '';
let bPrevOp   = null;
let bPrevNum  = null;
let bClearNext = false;
 
function updateDisplay(expr, result = '') {
  const exprEl   = document.getElementById('displayExpr');
  const resultEl = document.getElementById('displayResult');
  exprEl.textContent   = expr  || '0';
  resultEl.textContent = result ? '= ' + result : '';
  // Shrink font for long expressions
  exprEl.style.fontSize = expr.length > 14 ? '24px' : expr.length > 10 ? '30px' : '38px';
}
 
function basicNum(n) {
  if (bClearNext) { bExpr = ''; bClearNext = false; }
  if (n === '0' && bExpr === '0') return;
  if (bExpr === '0' && n !== '.') bExpr = n;
  else bExpr += n;
  updateDisplay(bExpr);
}
 
function basicDot() {
  if (bClearNext) { bExpr = '0'; bClearNext = false; }
  // Only add dot if last segment doesn't already have one
  const parts = bExpr.split(/[+\-×÷]/);
  if (!parts[parts.length - 1].includes('.')) {
    bExpr += (bExpr === '' || /[+\-×÷]$/.test(bExpr)) ? '0.' : '.';
    updateDisplay(bExpr);
  }
}
 
function basicOp(op) {
  if (bClearNext) bClearNext = false;
  if (bExpr === '' || bExpr === '0') { bExpr = '0'; }
  // Replace trailing operator if pressed twice
  if (/[+\-×÷]$/.test(bExpr)) {
    bExpr = bExpr.slice(0, -1) + op;
  } else {
    bExpr += op;
  }
  updateDisplay(bExpr);
}
 
function basicEquals() {
  if (!bExpr || /[+\-×÷]$/.test(bExpr)) return;
  const result = evalExpr(bExpr);
  updateDisplay(bExpr, formatNum(result));
  bExpr = formatNum(result);
  bClearNext = false;
}
 
function basicPercent() {
  if (!bExpr) return;
  const result = evalExpr(bExpr);
  bExpr = formatNum(result / 100);
  updateDisplay(bExpr);
}
 
function basicClear() {
  bExpr = '';
  bClearNext = false;
  updateDisplay('0');
}
 
function basicBackspace() {
  if (bClearNext) { basicClear(); return; }
  bExpr = bExpr.slice(0, -1);
  updateDisplay(bExpr || '0');
}
 
function evalExpr(expr) {
  // Replace display operators with JS operators
  const safe = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
  try {
    // Safely evaluate arithmetic
    const result = Function('"use strict"; return (' + safe + ')')();
    return isFinite(result) ? result : 'Error';
  } catch {
    return 'Error';
  }
}
 
function formatNum(n) {
  if (n === 'Error') return 'Error';
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(10)).toString();
}
 
// Keyboard support for basic calc
document.addEventListener('keydown', (e) => {
  const calcBasic = document.getElementById('calcBasic');
  if (!calcBasic.classList.contains('active')) return;
  if ('0123456789'.includes(e.key)) basicNum(e.key);
  else if (e.key === '.') basicDot();
  else if (e.key === '+') basicOp('+');
  else if (e.key === '-') basicOp('−');
  else if (e.key === '*') basicOp('×');
  else if (e.key === '/') { e.preventDefault(); basicOp('÷'); }
  else if (e.key === 'Enter' || e.key === '=') basicEquals();
  else if (e.key === 'Escape') basicClear();
  else if (e.key === 'Backspace') basicBackspace();
  else if (e.key === '%') basicPercent();
});
 
 
// ─────────────────────────────────────
// BMI CALCULATOR
// ─────────────────────────────────────
let bmiUnit = 'metric';
 
function setUnit(unit) {
  bmiUnit = unit;
  document.getElementById('metricInputs').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('imperialInputs').classList.toggle('hidden', unit !== 'imperial');
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');
  document.getElementById('bmiResult').style.display = 'none';
}
 
function calcBMI() {
  let weightKg, heightM;
 
  if (bmiUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('bmiWeightKg').value);
    heightM  = parseFloat(document.getElementById('bmiHeightM').value);
    if (!isValid(weightKg) || !isValid(heightM) || heightM <= 0) {
      showError('bmiResult', 'Please enter valid weight (kg) and height (m).');
      return;
    }
  } else {
    const lbs = parseFloat(document.getElementById('bmiWeightLb').value);
    const ft  = parseFloat(document.getElementById('bmiHeightFt').value) || 0;
    const ins = parseFloat(document.getElementById('bmiHeightIn').value) || 0;
    if (!isValid(lbs) || (!ft && !ins)) {
      showError('bmiResult', 'Please enter valid weight (lbs) and height (ft/in).');
      return;
    }
    weightKg = lbs * 0.453592;
    heightM  = (ft * 12 + ins) * 0.0254;
  }
 
  const bmi = weightKg / (heightM * heightM);
 
  let category, color, needle, hint;
  if (bmi < 18.5) {
    category = 'Underweight'; color = '#5ba4ff';
    needle = (bmi / 18.5) * 24;
    hint = 'Consider consulting a healthcare provider about healthy weight gain strategies.';
  } else if (bmi < 25) {
    category = 'Normal Weight'; color = '#36d68a';
    needle = 24 + ((bmi - 18.5) / 6.5) * 31;
    hint = 'Great! Maintain a balanced diet and regular exercise.';
  } else if (bmi < 30) {
    category = 'Overweight'; color = '#f5a623';
    needle = 55 + ((bmi - 25) / 5) * 20;
    hint = 'A healthcare provider can suggest personalised guidance for a healthier weight range.';
  } else {
    category = 'Obese'; color = '#ff6b6b';
    needle = Math.min(75 + ((bmi - 30) / 10) * 25, 99);
    hint = 'Please consult a healthcare professional for advice on managing your weight.';
  }
 
  const panel = document.getElementById('bmiResult');
  panel.style.display = 'flex';
 
  document.getElementById('bmiValue').textContent = bmi.toFixed(1);
  const catEl = document.getElementById('bmiCategory');
  catEl.textContent = category;
  catEl.style.color  = color;
 
  document.getElementById('bmiNeedle').style.left = needle + '%';
  document.getElementById('bmiHint').textContent  = hint;
}
 
 
// ─────────────────────────────────────
// AGE CALCULATOR
// ─────────────────────────────────────
function calcAge() {
  const dobVal   = document.getElementById('ageDob').value;
  const asOfVal  = document.getElementById('ageAsOf').value;
 
  if (!dobVal) {
    showError('ageResult', 'Please select a date of birth.');
    return;
  }
 
  const dob   = new Date(dobVal);
  const asOf  = asOfVal ? new Date(asOfVal) : new Date();
 
  // Normalize to midnight
  dob.setHours(0,0,0,0);
  asOf.setHours(0,0,0,0);
 
  if (dob > asOf) {
    showError('ageResult', 'Date of birth cannot be in the future.');
    return;
  }
 
  let years  = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days   = asOf.getDate() - dob.getDate();
 
  if (days < 0) {
    months--;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }
 
  // Total days lived
  const totalDays = Math.floor((asOf - dob) / 86400000);
 
  // Days until next birthday
  const nextBday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= asOf) nextBday.setFullYear(nextBday.getFullYear() + 1);
  const daysUntil = Math.ceil((nextBday - asOf) / 86400000);
 
  const panel = document.getElementById('ageResult');
  panel.style.display = 'flex';
 
  document.getElementById('ageYears').textContent  = years;
  document.getElementById('ageMonths').textContent = months;
  document.getElementById('ageDays').textContent   = days;
  document.getElementById('ageTotalDays').textContent =
    totalDays.toLocaleString() + ' total days lived';
  document.getElementById('ageNextBday').textContent =
    daysUntil === 0
      ? '🎂 Happy Birthday!'
      : daysUntil + ' days until next birthday';
}
 
 
// ─────────────────────────────────────
// LOAN / EMI CALCULATOR
// ─────────────────────────────────────
function calcLoan() {
  const P       = parseFloat(document.getElementById('loanPrincipal').value);
  const annRate = parseFloat(document.getElementById('loanRate').value);
  const years   = parseFloat(document.getElementById('loanYears').value);
  const symbol  = document.getElementById('loanCurrency').value;
 
  if (!isValid(P) || P <= 0)        { showError('loanResult', 'Enter a valid principal amount.'); return; }
  if (isNaN(annRate) || annRate < 0) { showError('loanResult', 'Enter a valid interest rate (0 or above).'); return; }
  if (!isValid(years) || years <= 0) { showError('loanResult', 'Enter a valid loan tenure.'); return; }
 
  const n = years * 12;
  let emi, totalPayable;
 
  if (annRate === 0) {
    emi = P / n;
  } else {
    const r = annRate / 100 / 12;
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
 
  totalPayable = emi * n;
  const totalInterest = totalPayable - P;
  const principalPct  = (P / totalPayable) * 100;
  const interestPct   = 100 - principalPct;
 
  const fmt = (val) => symbol + ' ' + Math.round(val).toLocaleString();
 
  const panel = document.getElementById('loanResult');
  panel.style.display = 'flex';
 
  document.getElementById('loanEMI').textContent      = fmt(emi);
  document.getElementById('loanInterest').textContent = fmt(totalInterest);
  document.getElementById('loanTotal').textContent    = fmt(totalPayable);
 
  document.getElementById('lbPrincipal').style.width = principalPct.toFixed(1) + '%';
  document.getElementById('lbInterest').style.width  = interestPct.toFixed(1) + '%';
}
 
 
// ─────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────
 
/** Returns true if value is a real finite number */
function isValid(v) {
  return !isNaN(v) && isFinite(v);
}
 
/**
 * Replaces panel content with an error message.
 * Caller should hide the panel first or pass the panel ID.
 */
function showError(panelId, message) {
  const panel = document.getElementById(panelId);
  panel.style.display = 'flex';
  panel.innerHTML = `
    <div class="error-msg">
      <i class="fa-solid fa-triangle-exclamation"></i>
      ${message}
    </div>
  `;
}
 
// Restore result panels after user changes inputs
(function bindInputReset() {
  const pairs = [
    ['bmiWeightKg','bmiResult'], ['bmiHeightM','bmiResult'],
    ['bmiWeightLb','bmiResult'], ['bmiHeightFt','bmiResult'], ['bmiHeightIn','bmiResult'],
    ['ageDob','ageResult'],      ['ageAsOf','ageResult'],
    ['loanPrincipal','loanResult'], ['loanRate','loanResult'], ['loanYears','loanResult'],
    ['loanCurrency','loanResult']
  ];
  pairs.forEach(([inputId, resultId]) => {
    const input = document.getElementById(inputId);
    const panel = document.getElementById(resultId);
    if (input && panel) {
      input.addEventListener('input', () => { panel.style.display = 'none'; });
      input.addEventListener('change', () => { panel.style.display = 'none'; });
    }
  });
})();
 
// Init: show home screen properly
(function init() {
  SCREENS.forEach(id => {
    const el = document.getElementById(id);
    if (id === 'homeScreen') {
      el.style.display = 'block';
      el.classList.add('active');
    } else {
      el.style.display = 'none';
    }
  });
})();