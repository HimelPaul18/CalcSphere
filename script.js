
/* CalcSphere — script.js */
 
/* ── NAVIGATION ── */
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
  const idMap = { basic:'calcBasic', bmi:'calcBmi', age:'calcAge', loan:'calcLoan' };
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
 
document.addEventListener('keydown', (e) => {
  const card = e.target.closest('.calc-card');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); card.click(); }
});
 
/* ── BASIC CALCULATOR ── */
let bExpr = '', bClearNext = false;
 
function updateDisplay(expr, result = '') {
  const exprEl = document.getElementById('displayExpr');
  const resEl  = document.getElementById('displayResult');
  exprEl.textContent = expr || '0';
  resEl.textContent  = result ? '= ' + result : '';
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
  const parts = bExpr.split(/[+\-×÷]/);
  if (!parts[parts.length - 1].includes('.')) {
    bExpr += (bExpr === '' || /[+\-×÷]$/.test(bExpr)) ? '0.' : '.';
    updateDisplay(bExpr);
  }
}
 
function basicOp(op) {
  if (bClearNext) bClearNext = false;
  if (bExpr === '' || bExpr === '0') { bExpr = '0'; }
  if (/[+\-×÷]$/.test(bExpr)) bExpr = bExpr.slice(0, -1) + op;
  else bExpr += op;
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
  bExpr = formatNum(evalExpr(bExpr) / 100);
  updateDisplay(bExpr);
}
 
function basicClear() {
  bExpr = ''; bClearNext = false; updateDisplay('0');
}
 
function basicBackspace() {
  if (bClearNext) { basicClear(); return; }
  bExpr = bExpr.slice(0, -1);
  updateDisplay(bExpr || '0');
}
 
function evalExpr(expr) {
  const safe = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
  try {
    const result = Function('"use strict"; return (' + safe + ')')();
    return isFinite(result) ? result : 'Error';
  } catch { return 'Error'; }
}
 
function formatNum(n) {
  if (n === 'Error') return 'Error';
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(10)).toString();
}
 
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('calcBasic').classList.contains('active')) return;
  if ('0123456789'.includes(e.key)) basicNum(e.key);
  else if (e.key === '.')           basicDot();
  else if (e.key === '+')           basicOp('+');
  else if (e.key === '-')           basicOp('−');
  else if (e.key === '*')           basicOp('×');
  else if (e.key === '/') { e.preventDefault(); basicOp('÷'); }
  else if (e.key === 'Enter' || e.key === '=') basicEquals();
  else if (e.key === 'Escape')    basicClear();
  else if (e.key === 'Backspace') basicBackspace();
  else if (e.key === '%')         basicPercent();
});
 
/* ── BMI CALCULATOR ── */
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
      showError('bmiResult', 'সঠিক weight (kg) এবং height (m) দিন।'); return;
    }
  } else {
    const lbs = parseFloat(document.getElementById('bmiWeightLb').value);
    const ft  = parseFloat(document.getElementById('bmiHeightFt').value) || 0;
    const ins = parseFloat(document.getElementById('bmiHeightIn').value) || 0;
    if (!isValid(lbs) || (!ft && !ins)) {
      showError('bmiResult', 'সঠিক weight (lbs) এবং height (ft/in) দিন।'); return;
    }
    weightKg = lbs * 0.453592;
    heightM  = (ft * 12 + ins) * 0.0254;
  }
 
  const bmi = weightKg / (heightM * heightM);
  let category, color, needle, hint;
 
  if (bmi < 18.5) {
    category='Underweight'; color='#5ba4ff'; needle=(bmi/18.5)*24;
    hint='একজন স্বাস্থ্যসেবা প্রদানকারীর পরামর্শ নিন।';
  } else if (bmi < 25) {
    category='Normal Weight'; color='#36d68a'; needle=24+((bmi-18.5)/6.5)*31;
    hint='চমৎকার! সুষম খাদ্য ও নিয়মিত ব্যায়াম চালিয়ে যান।';
  } else if (bmi < 30) {
    category='Overweight'; color='#f5a623'; needle=55+((bmi-25)/5)*20;
    hint='একজন স্বাস্থ্যসেবা প্রদানকারীর পরামর্শ নিতে পারেন।';
  } else {
    category='Obese'; color='#ff6b6b'; needle=Math.min(75+((bmi-30)/10)*25, 99);
    hint='অনুগ্রহ করে একজন ডাক্তারের সাথে পরামর্শ করুন।';
  }
 
  const panel = document.getElementById('bmiResult');
  clearError(panel);
  panel.style.display = 'flex';
 
  document.getElementById('bmiValue').textContent    = bmi.toFixed(1);
  const catEl = document.getElementById('bmiCategory');
  catEl.textContent = category;
  catEl.style.color = color;
  document.getElementById('bmiNeedle').style.left    = needle + '%';
  document.getElementById('bmiHint').textContent     = hint;
}
 
/* ── AGE CALCULATOR ── */
function calcAge() {
  const dobVal  = document.getElementById('ageDob').value;
  const asOfVal = document.getElementById('ageAsOf').value;
 
  if (!dobVal) { showError('ageResult', 'জন্ম তারিখ সিলেক্ট করুন।'); return; }
 
  const dob  = new Date(dobVal);
  const asOf = asOfVal ? new Date(asOfVal) : new Date();
  dob.setHours(0,0,0,0); asOf.setHours(0,0,0,0);
 
  if (dob > asOf) { showError('ageResult', 'জন্ম তারিখ ভবিষ্যতে হতে পারে না।'); return; }
 
  let years  = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth()    - dob.getMonth();
  let days   = asOf.getDate()     - dob.getDate();
 
  if (days < 0) {
    months--;
    days += new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }
 
  const totalDays = Math.floor((asOf - dob) / 86400000);
  const nextBday  = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= asOf) nextBday.setFullYear(nextBday.getFullYear() + 1);
  const daysUntil = Math.ceil((nextBday - asOf) / 86400000);
 
  const panel = document.getElementById('ageResult');
  clearError(panel);
  panel.style.display = 'flex';
 
  document.getElementById('ageYears').textContent  = years;
  document.getElementById('ageMonths').textContent = months;
  document.getElementById('ageDays').textContent   = days;
  document.getElementById('ageTotalDays').textContent = totalDays.toLocaleString() + ' total days lived';
  document.getElementById('ageNextBday').textContent  =
    daysUntil === 0 ? '🎂 Happy Birthday!' : daysUntil + ' days until next birthday';
}
 
/* ── LOAN CALCULATOR ── */
function calcLoan() {
  const P       = parseFloat(document.getElementById('loanPrincipal').value);
  const annRate = parseFloat(document.getElementById('loanRate').value);
  const years   = parseFloat(document.getElementById('loanYears').value);
  const symbol  = document.getElementById('loanCurrency').value;
 
  if (!isValid(P) || P <= 0)         { showError('loanResult', 'সঠিক principal amount দিন।'); return; }
  if (isNaN(annRate) || annRate < 0) { showError('loanResult', 'সঠিক interest rate দিন (0 বা বেশি)।'); return; }
  if (!isValid(years) || years <= 0) { showError('loanResult', 'সঠিক loan tenure দিন (১ বছর বা বেশি)।'); return; }
 
  const n = years * 12;
  let emi;
 
  if (annRate === 0) {
    emi = P / n;
  } else {
    const r = annRate / 100 / 12;
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
 
  const totalPayable  = emi * n;
  const totalInterest = totalPayable - P;
  const principalPct  = (P / totalPayable) * 100;
  const interestPct   = 100 - principalPct;
  const fmt = (val) => symbol + ' ' + Math.round(val).toLocaleString();
 
  const panel = document.getElementById('loanResult');
  clearError(panel);
  panel.style.display = 'flex';
 
  document.getElementById('loanEMI').textContent      = fmt(emi);
  document.getElementById('loanInterest').textContent = fmt(totalInterest);
  document.getElementById('loanTotal').textContent    = fmt(totalPayable);
  document.getElementById('lbPrincipal').style.width  = principalPct.toFixed(1) + '%';
  document.getElementById('lbInterest').style.width   = interestPct.toFixed(1) + '%';
}
 
/* ── UTILITIES ── */
function isValid(v) {
  return !isNaN(v) && isFinite(v);
}
 
// Error দেখায় — panel এর আসল content নষ্ট করে না
function showError(panelId, message) {
  const panel = typeof panelId === 'string'
    ? document.getElementById(panelId)
    : panelId;
 
  clearError(panel); // আগের error সরাও
 
  // আসল content hide করো
  Array.from(panel.children).forEach(el => el.style.display = 'none');
 
  // Error div বানাও
  const err = document.createElement('div');
  err.className = 'error-msg error-temp';
  err.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${message}`;
  panel.appendChild(err);
  panel.style.display = 'flex';
}
 
// Error সরাও, আসল content ফেরত আনো
function clearError(panelOrId) {
  const panel = typeof panelOrId === 'string'
    ? document.getElementById(panelOrId)
    : panelOrId;
  const err = panel.querySelector('.error-temp');
  if (err) err.remove();
  Array.from(panel.children).forEach(el => el.style.display = '');
}
 
// Input বদলালে result panel লুকাও
(function bindInputReset() {
  const pairs = [
    ['bmiWeightKg','bmiResult'], ['bmiHeightM','bmiResult'],
    ['bmiWeightLb','bmiResult'], ['bmiHeightFt','bmiResult'], ['bmiHeightIn','bmiResult'],
    ['ageDob','ageResult'],      ['ageAsOf','ageResult'],
    ['loanPrincipal','loanResult'], ['loanRate','loanResult'],
    ['loanYears','loanResult'],     ['loanCurrency','loanResult']
  ];
  pairs.forEach(([inputId, resultId]) => {
    const input = document.getElementById(inputId);
    const panel = document.getElementById(resultId);
    if (input && panel) {
      const hide = () => {
        clearError(panel);
        panel.style.display = 'none';
      };
      input.addEventListener('input',  hide);
      input.addEventListener('change', hide);
    }
  });
})();
 
// Init
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
