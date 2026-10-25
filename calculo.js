// --- Evento para el botón de mostrar/ocultar tabla y el Tema ---
document.addEventListener('DOMContentLoaded', () => {
    const toggleTableBtn = document.getElementById('toggleTableBtn');
    const tableContainer = document.getElementById('tableContainer');
    
    if (toggleTableBtn && tableContainer) {
        toggleTableBtn.addEventListener('click', () => {
            if (tableContainer.classList.contains('show')) {
                tableContainer.classList.remove('show');
                toggleTableBtn.textContent = 'Ver más opciones (Alternativas)';
            } else {
                tableContainer.classList.add('show');
                toggleTableBtn.textContent = 'Ocultar opciones';
            }
        });
    }

    // --- Lógica del Modo Claro / Oscuro ---
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if(document.body.classList.contains('light-mode')) {
                themeToggle.textContent = '🌙';
                themeToggle.setAttribute('title', 'Cambiar a Modo Oscuro');
            } else {
                themeToggle.textContent = '☀️';
                themeToggle.setAttribute('title', 'Cambiar a Modo Claro');
            }
        });
    }

    // --- Modal Logic ---
    const colorModal = document.getElementById('colorModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            colorModal.classList.remove('show');
            setTimeout(() => { colorModal.style.display = 'none'; }, 300);
        });
    }

    // Clic fuera del modal para cerrarlo
    window.addEventListener('click', (e) => {
        if (e.target === colorModal) {
            colorModal.classList.remove('show');
            setTimeout(() => { colorModal.style.display = 'none'; }, 300);
        }
    });

    // Clic en las tarjetas (requieren que les pongas id="card1", etc. en HTML)
    document.getElementById('card1')?.addEventListener('click', () => abrirModalColores('1'));
    document.getElementById('card2')?.addEventListener('click', () => abrirModalColores('2'));
    document.getElementById('card3')?.addEventListener('click', () => abrirModalColores('3'));
    document.getElementById('copyReportBtn')?.addEventListener('click', () => copyReport());
});

// --- Constantes para Código de Colores ---
const COLOR_CODES = {
    0: '#000000', 1: '#8b4513', 2: '#c51313', 3: '#ff5100', 
    4: '#ecd60f', 5: '#008000', 6: '#0000ff', 7: '#9824ce', 
    8: '#808080', 9: '#ffffff'
};
const MULTIPLIER_CODES = {
    "-2": '#c0c0c0', "-1": '#ff9900', "0": '#000000', "1": '#8b4513', 
    "2": '#c51313', "3": '#ff5100', "4": '#ecd60f', "5": '#008000', 
    "6": '#0000ff', "7": '#9824ce'
};
const COLOR_NAMES = {
    '#000000': 'Negro', '#8b4513': 'Marrón (1)', '#c51313': 'Rojo (2)', '#ff5100': 'Naranja (3)', 
    '#ecd60f': 'Amarillo (4)', '#008000': 'Verde (5)', '#0000ff': 'Azul (6)', '#9824ce': 'Violeta (7)', 
    '#808080': 'Gris (8)', '#ffffff': 'Blanco (9)', '#c0c0c0': 'Plata (10% / x0.01)', '#ff9900': 'Oro (5% / x0.1)'
};

let currentBestCards = { '1': null, '2': null, '3': null };
let currentTolerance = 10;

// --- Tablas de valores estándar EIA ---
const E12_BASE = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
const E96_BASE = [
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 
    133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174, 
    178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 
    237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 
    316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 
    422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 
    562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 
    750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976
];

function generarCatalogo(tolerancia, target) {
    const esE12 = (tolerancia === 10);
    const base = esE12 ? E12_BASE : E96_BASE;
    const multiplicadores = esE12 
        ? [0.1, 1, 10, 100, 1000, 10000, 100000, 1000000] 
        : [0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
    
    let valores = new Set();
    for (let m of multiplicadores) {
        for (let b of base) {
            let v = parseFloat((b * m).toFixed(3));
            if (v >= 0.1 && v <= target * 80) {
                valores.add(v);
            }
        }
    }
    return Array.from(valores).sort((a, b) => a - b);
}

function formatOhm(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(3).replace(/\.?0+$/, '') + ' MΩ';
    if (val >= 1000) return (val / 1000).toFixed(3).replace(/\.?0+$/, '') + ' kΩ';
    return val.toFixed(2).replace(/\.?0+$/, '') + ' Ω';
}

function getResistorColors(val, tol) {
    let tolColor = tol === 10 ? '#c0c0c0' : '#8b4513'; // Plata (10%) o Marrón (1%)
    let sigFigs = tol === 10 ? 2 : 3;
    let expStr = val.toExponential(sigFigs - 1);
    let parts = expStr.split('e');
    let coeffStr = parts[0].replace('.', '');
    let exp = parseInt(parts[1], 10);
    let multExp = exp - (sigFigs - 1);
    
    let colors = coeffStr.split('').map(d => COLOR_CODES[parseInt(d, 10)]);
    colors.push(MULTIPLIER_CODES[multExp] || '#000000');
    colors.push(tolColor);
    
    return colors;
}

function abrirModalColores(cardId) {
    const item = currentBestCards[cardId];
    if (!item) return;

    const modal = document.getElementById('colorModal');
    const container = document.getElementById('modalResistorsContainer');
    container.innerHTML = '';
    
    item.components.forEach(val => {
        let colors = getResistorColors(val, currentTolerance);
        
        let bandHTML = colors.map(c => 
            `<div class="band band-tooltip" data-color="${COLOR_NAMES[c] || 'Desconocido'}" style="background-color: ${c};"></div>`
        ).join('');
        
        container.innerHTML += `
            <div class="modal-resistor-item">
                <div class="modal-resistor-val">${formatOhm(val)}</div>
                <div class="static-resistor">
                    <div class="wire"></div>
                    <div class="resistor-body">
                        ${bandHTML}
                    </div>
                    <div class="wire"></div>
                </div>
            </div>
        `;
    });
    
    modal.style.display = 'flex';
    // Pequeño retardo para que la transición CSS funcione correctamente
    setTimeout(() => { modal.classList.add('show'); }, 10);
}

function drawDiagram(item) {
    const cont = document.getElementById('diagramContainer');
    if(!item) return;
    let html = '<div class="diag-line"></div>';
    
    if(item.cant === 1) {
        html += `<div class="diag-res">${formatOhm(item.components[0])}</div>`;
    } 
    else if(item.tipo === 'Serie' || item.tipo === 'Serie pura') {
        item.components.forEach((c, i) => {
            html += `<div class="diag-res">${formatOhm(c)}</div>`;
            if(i < item.components.length -1) html += '<div class="diag-line" style="width:15px;"></div>';
        });
    }
    else if(item.tipo === 'Paralelo' || item.tipo === 'Paralelo puro') {
        html += '<div class="diag-parallel">';
        item.components.forEach(c => { html += `<div class="diag-res">${formatOhm(c)}</div>`; });
        html += '</div>';
    }
    else if(item.tipo === 'Mixto (Serie-Paralelo)') { // Ra + (Rb || Rc)
        html += `<div class="diag-res">${formatOhm(item.components[0])}</div><div class="diag-line" style="width:15px;"></div>`;
        html += '<div class="diag-parallel">';
        html += `<div class="diag-res">${formatOhm(item.components[1])}</div><div class="diag-res">${formatOhm(item.components[2])}</div>`;
        html += '</div>';
    }
    else if(item.tipo === 'Mixto (Paralelo-Serie)') { // Ra || (Rb + Rc)
        html += '<div class="diag-parallel" style="flex-direction:row; align-items:center;">';
        html += `<div class="diag-res" style="height:fit-content;">${formatOhm(item.components[0])}</div>`;
        html += '<div style="display:flex; flex-direction:column; gap:5px;"><div class="diag-res">${formatOhm(item.components[1])}</div><div class="diag-res">${formatOhm(item.components[2])}</div></div>';
        html += '</div>';
    }
    html += '<div class="diag-line"></div>';
    cont.innerHTML = html;
}

function checkPower(item, voltage) {
    const pa = document.getElementById('powerAnalysis');
    if(!voltage || voltage <= 0) { pa.style.display = 'none'; return; }
    
    // I = V / Req
    let i_total = voltage / item.val;
    let msg = `🔥 <strong>Análisis de Potencia (V = ${voltage}V, I_total = ${(i_total*1000).toFixed(1)}mA)</strong><br>`;
    
    let maxP = 0;
    if(item.cant === 1) {
        maxP = (voltage*voltage) / item.components[0];
    } else if(item.tipo.includes('Serie') && !item.tipo.includes('Mixto')) {
        item.components.forEach(r => maxP = Math.max(maxP, i_total*i_total*r));
    } else {
        // Para simplificar, advertimos sobre la disipación total
        maxP = voltage * i_total;
        msg += `<span style="font-size:0.8rem; color:var(--text-muted);">*En arreglos paralelos se muestra la disipación total.</span><br>`;
    }
    
    let rec = "1/4 W (Estándar)";
    if(maxP > 0.125 && maxP <= 0.25) rec = "1/2 W (Margen de seguridad recomendado)";
    else if(maxP > 0.25 && maxP <= 0.5) rec = "1 W (Resistencia de potencia)";
    else if(maxP > 0.5) rec = "Resistencias de Cerámica (Alta Potencia >1W)";
    
    msg += `Max disipación estimada: <strong>${(maxP).toFixed(3)} W</strong> -> Se recomienda usar resistencias de: <strong>${rec}</strong>`;
    pa.innerHTML = msg;
    pa.style.display = 'block';
}

function copyReport() {
    let g = currentBestCards['global'];
    if(!g) return;
    let colorList = g.components.map(r => getResistorColors(r, currentTolerance).map(c=>COLOR_NAMES[c].split(' ')[0]).join('-')).join(' / ');
    
    let text = `--- REPORTE DE RESISTENCIA COMERCIAL ---\n` +
               `Valor objetivo: ${document.getElementById('targetVal').value} ${document.getElementById('unitSelector').options[document.getElementById('unitSelector').selectedIndex].text} | Tolerancia: ${currentTolerance}%\n` +
               `Configuración ganadora: ${g.cant} componente(s) [${g.tipo}]\n` +
               `Fórmula: ${g.desc.replace(/&nbsp;/g,' ')}\n` +
               `Valor real obtenido: ${formatOhm(g.val)}\n` +
               `Error relativo: ${g.err.toFixed(4)}%\n` +
               `Colores a buscar: ${colorList}\n`;
    
    if(currentVoltage > 0) text += `Voltaje: ${currentVoltage}V | Disipación total: ${(currentVoltage*currentVoltage/g.val).toFixed(3)}W\n`;
    
    navigator.clipboard.writeText(text).then(() => {
        let btn = document.getElementById('copyReportBtn');
        btn.innerHTML = '✅ ¡Copiado!';
        setTimeout(() => btn.innerHTML = '📋 Copiar Reporte Lab', 2000);
    });
}

function ejecutarCalculo() {
    const rawVal = parseFloat(document.getElementById('targetVal').value);
    const unitMult = parseFloat(document.getElementById('unitSelector').value);
    currentTolerance = parseInt(document.getElementById('toleranceSelector').value);
    currentVoltage = parseFloat(document.getElementById('voltageVal').value) || 0;

    if (isNaN(rawVal) || rawVal <= 0) { alert('Por favor, ingresa un valor válido.'); return; }

    const target = rawVal * unitMult;
    const btn = document.getElementById('calcBtn');
    document.getElementById('loaderOverlay').style.display = 'flex';
    btn.disabled = true;

    setTimeout(() => {
        const catalogo = generarCatalogo(currentTolerance, target);
        let b1=null, d1=Infinity, b2=null, d2=Infinity, b3=null, d3=Infinity, todas=[];

        function registrar(val, cant, tipo, desc, components) {
            let diff = Math.abs(val - target);
            let item = { val, diff, err: (diff/target)*100, cant, tipo, desc, components };
            if (cant===1 && diff<d1) { d1=diff; b1=item; }
            if (cant===2 && diff<d2) { d2=diff; b2=item; }
            if (cant===3 && diff<d3) { d3=diff; b3=item; }
            todas.push(item);
        }

        catalogo.forEach(r => registrar(r,1,'Individual',formatOhm(r),[r]));
        
        for(let i=0; i<catalogo.length; i++) for(let j=i; j<catalogo.length; j++) {
            registrar(catalogo[i]+catalogo[j], 2, 'Serie', `${formatOhm(catalogo[i])} + ${formatOhm(catalogo[j])}`, [catalogo[i],catalogo[j]]);
            registrar(1/(1/catalogo[i]+1/catalogo[j]), 2, 'Paralelo', `${formatOhm(catalogo[i])} || ${formatOhm(catalogo[j])}`, [catalogo[i],catalogo[j]]);
        }

        let sub = catalogo.length>70 ? catalogo.slice(Math.max(0, catalogo.findIndex(x=>x>=target)-35), Math.min(catalogo.length, catalogo.findIndex(x=>x>=target)+35)) : catalogo;
        for(let i=0; i<sub.length; i++) for(let j=i; j<sub.length; j++) for(let k=j; k<sub.length; k++) {
            let r1=sub[i], r2=sub[j], r3=sub[k];
            registrar(r1+r2+r3, 3, 'Serie pura', `${formatOhm(r1)} + ${formatOhm(r2)} + ${formatOhm(r3)}`, [r1,r2,r3]);
            registrar(1/(1/r1+1/r2+1/r3), 3, 'Paralelo puro', `${formatOhm(r1)} || ${formatOhm(r2)} || ${formatOhm(r3)}`, [r1,r2,r3]);
            [[r1,r2,r3],[r2,r1,r3],[r3,r1,r2]].forEach(t => {
                registrar(t[0]+(t[1]*t[2])/(t[1]+t[2]), 3, 'Mixto (Serie-Paralelo)', `${formatOhm(t[0])} + (${formatOhm(t[1])} || ${formatOhm(t[2])})`, t);
                registrar((t[0]*(t[1]+t[2]))/(t[0]+t[1]+t[2]), 3, 'Mixto (Paralelo-Serie)', `${formatOhm(t[0])} || (${formatOhm(t[1])} + ${formatOhm(t[2])})`, t);
            });
        }

        let bg = b1; 
        if(b2&&b2.diff<bg.diff) bg=b2; 
        if(b3&&b3.diff<bg.diff) bg=b3;
        currentBestCards['global'] = bg;

        document.getElementById('globalVal').textContent = formatOhm(bg.val);
        document.getElementById('globalErr').textContent = bg.err.toFixed(4) + '% Error';
        document.getElementById('globalErr').className = 'error-tag ' + (bg.err<0.05?'error-perfect':'error-good');
        document.getElementById('globalDesc').innerHTML = `<strong>${bg.cant} resistencia(s) [${bg.tipo}]:</strong> ${bg.desc}`;

        drawDiagram(bg);
        checkPower(bg, currentVoltage);

        renderSubCard('val1','err1','cfg1',b1,'1'); renderSubCard('val2','err2','cfg2',b2,'2'); renderSubCard('val3','err3','cfg3',b3,'3');

        todas.sort((a,b)=>a.diff-b.diff);
        let tbody = document.getElementById('altTableBody'), vistas=new Set(), mostradas=0;
        if(tbody) { tbody.innerHTML=''; for(let item of todas) {
            let k=`${item.tipo}-${item.val.toFixed(2)}-${item.desc}`;
            if(!vistas.has(k)) { vistas.add(k);
                tbody.innerHTML += `<tr><td>${item.cant}</td><td><span class="badge-type">${item.tipo}</span></td><td>${item.desc}</td><td><strong>${formatOhm(item.val)}</strong></td><td><span class="error-tag ${item.err<0.05?'error-perfect':'error-good'}">${item.err.toFixed(3)}%</span></td></tr>`;
                if(++mostradas>=6) break;
            }
        }}
        
        let tBtn=document.getElementById('toggleTableBtn'), tCont=document.getElementById('tableContainer');
        if(tBtn&&tCont) { tBtn.style.display='block'; tCont.classList.remove('show'); tBtn.textContent='Ver más opciones (Alternativas)'; }
        
        document.getElementById('loaderOverlay').style.display='none'; btn.disabled=false; document.getElementById('results').style.display='flex';
    }, 800);
}

function renderSubCard(valId, errId, cfgId, item, cardId) {
    if (!item) return;
    document.getElementById(valId).textContent = formatOhm(item.val);
    const errSpan = document.getElementById(errId);
    errSpan.textContent = item.err.toFixed(3) + '%';
    errSpan.className = 'error-tag ' + (item.err < 0.05 ? 'error-perfect' : 'error-good');
    document.getElementById(cfgId).textContent = `${item.tipo}: ${item.desc}`;
    
    currentBestCards[cardId] = item;
}