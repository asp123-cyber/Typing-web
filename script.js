'use strict';
const el = id => document.getElementById(id);
const hand = el('hand'), mode = el('mode'), lengthSelect = el('length');
const entry = el('entry'), display = el('display');
const keys = new Map();
let target, bag, spans, cursor, started, finished, timerId, lastValue, hits, attempts, speeds;
let soundEnabled = false, audio;
const lengths = {words: 50, time: 60};

function makeKeyboard() {
    const rows = [['Tab', ...'qwertyuiop', '⌫'], ['Caps', ...'asdfghjkl', 'Enter'], ['Shift', ...'zxcvbnm', 'Shift'], ['Space']];
    for (const letters of rows) {
        const row = document.createElement('div');
        row.className = 'row';
        for (const letter of letters) {
            const key = document.createElement('span');
            const side = LEFT_KEYS.includes(letter) ? 'left' : RIGHT_KEYS.includes(letter) ? 'right' : 'neutral wide';
            key.className = 'key ' + side + (letter === 'Space' ? ' space' : '');
            key.textContent = letter.length === 1 ? letter.toUpperCase() : letter;
            row.append(key);
            keys.set(letter === 'Space' ? ' ' : letter, key);
        }
        el('keyboard').append(row);
    }
}

function nextWord() {
    if (!bag.length) {
        bag = [...banks[hand.value]];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
    }
    return bag.pop();
}
function appendWords(count) {
    const fragment = document.createDocumentFragment();
    function addChar(parent, char) {
        const span = document.createElement('span');
        span.textContent = char;
        parent.append(span);
        spans.push(span);
        target += char;
    }
    for (let i = 0; i < count; i++) {
        if (target) addChar(fragment, ' ');
        const group = document.createElement('span');
        group.className = 'word';
        for (const letter of nextWord()) addChar(group, letter);
        fragment.append(group);
    }
    display.append(fragment);
    el('accessible-passage').textContent = target;
}
function updateCursor(position) {
    spans[cursor]?.classList.remove('current');
    keys.get(target[cursor])?.classList.remove('next');
    cursor = position;
    const current = spans[cursor];
    if (current) {
        current.classList.add('current');
        keys.get(target[cursor])?.classList.add('next');
        const lineHeight = parseFloat(getComputedStyle(display).lineHeight);
        display.scrollTop = Math.max(0, current.offsetTop - lineHeight);
    }
}
function setLengths() {
    const timed = mode.value === 'time';
    lengthSelect.replaceChildren(...(timed ? [30,60,120] : [25,50,100]).map(n => new Option(n + (timed ? ' sec' : ''), n)));
    lengthSelect.value = lengths[mode.value];
    el('length-label').textContent = timed ? 'Duration' : 'Word count';
}
function reset() {
    clearInterval(timerId);
    finished = false;
    started = null;
    lastValue = target = '';
    hits = attempts = cursor = 0;
    spans = []; bag = []; speeds = [];
    display.replaceChildren();
    entry.value = '';
    el('passage').hidden = false;
    el('results').hidden = true;
    appendWords(mode.value === 'words' ? +lengthSelect.value : 50);
    for (const key of keys.values()) {
        key.classList.remove('next','pressed');
        key.classList.toggle('muted', hand.value !== 'both' && !key.classList.contains(hand.value));
    }
    updateCursor(0);
    el('status').textContent = 'Ready';
    el('hint').textContent = 'Start typing to begin';
    el('timer-label').textContent = mode.value === 'time' ? 'Time remaining' : 'Elapsed time';
    metrics();
}
function chart() {
    const canvas = el('spark'), ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,105,34);
    ctx.strokeStyle = '#e1e2d9';
    ctx.beginPath();ctx.moveTo(0,30);ctx.lineTo(105,30);ctx.stroke();
    const points = [0,...speeds.slice(-18)];
    ctx.strokeStyle = '#c3683a';ctx.lineWidth = 2;ctx.beginPath();
    const max = Math.max(20,...points);
    points.forEach((speed,i) => ctx.lineTo(2+i*101/Math.max(1,points.length-1),29-speed/max*23));
    ctx.stroke();
}
function metrics() {
    const elapsed = started === null ? 0 : (performance.now()-started)/1000;
    const timed = mode.value === 'time', limit = +lengthSelect.value;
    const seconds = timed ? Math.min(limit,elapsed) : elapsed;
    let correct = 0;
    for (let i = 0; i < lastValue.length; i++) if (lastValue[i] === target[i]) correct++;
    const wpm = seconds ? Math.round(correct*12/Math.max(1,seconds)) : 0;
    const accuracy = attempts ? Math.round(100*hits/attempts) : 100;
    const clock = timed ? Math.max(0,limit-Math.floor(seconds)) : Math.floor(seconds);
    el('timer').textContent = Math.floor(clock/60)+':'+String(clock%60).padStart(2,'0');
    el('wpm').textContent = wpm;
    el('accuracy').textContent = accuracy;
    el('accuracy-bar').style.width = accuracy+'%';
    chart();
    return {elapsed,wpm,accuracy,correct};
}
function finish(stats) {
    finished = true;
    clearInterval(timerId);
    el('passage').hidden = true;
    el('results').hidden = false;
    el('summary').textContent = stats.wpm+' WPM · '+stats.accuracy+'% accuracy · '+Math.ceil(mode.value === 'time' ? +lengthSelect.value : stats.elapsed)+'s · '+stats.correct+'/'+lastValue.length+' characters correct';
    el('hint').textContent = 'Restart for a fresh passage';
    el('status').textContent = 'Complete';
    el('restart').focus({preventScroll:true});
}
function tick() {
    const stats = metrics();
    if (mode.value === 'time' && stats.elapsed >= +lengthSelect.value) finish(stats);
    else {speeds.push(stats.wpm); chart();}
}
function tone() {
    if (!audio || !soundEnabled) return;
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.frequency.value = 640;
    gain.gain.setValueAtTime(.025,audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.035);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime+.04);
}
entry.addEventListener('input', () => {
    if (finished) return;
    if (started !== null && mode.value === 'time' && performance.now()-started >= 1000*lengthSelect.value) return finish(metrics());
    if (started === null) {
        started = performance.now();
        timerId = setInterval(tick,1000);
        el('status').textContent = 'Typing';
    }
    if (mode.value === 'time') while (entry.value.length >= target.length-12) appendWords(35);
    const value = entry.value.slice(0,target.length);
    if (entry.value !== value) entry.value = value;
    let first = 0;
    while (first < value.length && first < lastValue.length && value[first] === lastValue[first]) first++;
    for (let i = first; i < Math.max(value.length,lastValue.length); i++) {
        spans[i].classList.remove('correct','incorrect');
        if (i < value.length) {
            const match = value[i] === target[i];
            spans[i].classList.add(match ? 'correct' : 'incorrect');
            attempts++; if (match) hits++;
        }
    }
    if (value.length > lastValue.length) {
        tone();
        const key = keys.get(value.at(-1));
        if (key) {key.classList.add('pressed'); setTimeout(() => key.classList.remove('pressed'),140);}
    }
    lastValue = value;
    updateCursor(value.length);
    const words = (target.slice(0,value.length).match(/ /g)||[]).length + Number(value.length === target.length);
    el('hint').textContent = words + (mode.value === 'words' ? ' / '+lengthSelect.value : '') + ' words';
    const stats = metrics();
    if (mode.value === 'words' && value.length === target.length) finish(stats);
});
function restart() {reset();entry.focus({preventScroll:true});}
hand.onchange = restart;
mode.onchange = () => {setLengths();restart();};
lengthSelect.onchange = () => {lengths[mode.value] = +lengthSelect.value;restart();};
el('restart').onclick = restart;
el('sound').onclick = async () => {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) {el('sound').textContent='Sound unavailable';return;}
    soundEnabled = !soundEnabled;
    if (soundEnabled) {audio ??= new Audio(); await audio.resume(); tone();}
    el('sound').textContent = '♪ Sound '+(soundEnabled ? 'on' : 'off');
    el('sound').setAttribute('aria-pressed',soundEnabled);
    if (!finished) entry.focus({preventScroll:true});
};
makeKeyboard();
setLengths();
reset();
if (matchMedia('(pointer:fine)').matches) entry.focus({preventScroll:true});

// Draw a slowly shifting wire surface in the studio banner.
const banner = el('wave'), ctx = banner.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let frame, lastFrame = -100;
function drawWave(time) {
    const w = banner.clientWidth, h = banner.clientHeight;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#ffffff0c';ctx.lineWidth=1;ctx.beginPath();
    for(let x=0;x<w;x+=32){ctx.moveTo(x,0);ctx.lineTo(x,h);}
    for(let y=0;y<h;y+=32){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();
    const gradient=ctx.createLinearGradient(w*.34,0,w*.98,0);
    gradient.addColorStop(0,'#f78c4600');gradient.addColorStop(.35,'#db7444aa');gradient.addColorStop(.75,'#ffac6fed');gradient.addColorStop(1,'#ed8a54c9');
    ctx.strokeStyle=gradient;
    const phase=reduced.matches?0:time*.00012;
    function point(u,v) {
        const crest = Math.sin(u*7.6 + v*2.6 + phase*.7) * .20 + Math.sin(u*13 - v*3 + phase)*.08;
        return [w*(.35+u*.74+v*.12),h*(.62+v*.62+crest*1.6-u*.38)];
    }
    function line(count,coords) {
        ctx.beginPath();
        for(let i=0;i<=count;i++){const [x,y]=point(...coords(i/count)); if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
        ctx.stroke();
    }
    ctx.lineWidth=.95;
    for(let j=0;j<=42;j++)line(105,u=>[u,j/42-.5]);
    ctx.lineWidth=.55;
    for(let j=0;j<=80;j++)line(38,v=>[j/80,v-.5]);
}
function animate(time) {
    if(time-lastFrame>65){drawWave(time);lastFrame=time;}
    if(!reduced.matches && !document.hidden) frame=requestAnimationFrame(animate);
}
function resizeWave() {
    cancelAnimationFrame(frame);
    const scale=Math.min(devicePixelRatio,2);
    banner.width=banner.clientWidth*scale;banner.height=banner.clientHeight*scale;
    ctx.setTransform(scale,0,0,scale,0,0);
    drawWave(performance.now());
    if(!reduced.matches && !document.hidden)frame=requestAnimationFrame(animate);
}
new ResizeObserver(resizeWave).observe(banner);
reduced.addEventListener('change',resizeWave);
document.addEventListener('visibilitychange',resizeWave);
