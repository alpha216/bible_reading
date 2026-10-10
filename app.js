const $ = (selector) => document.querySelector(selector);
function localDate(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
let today = localDate(), selected = today, year = new Date().getFullYear(), month = new Date().getMonth() + 1;
let schedule = generateSchedule(year);
function changeYear(nextYear) {
    if (!Number.isInteger(nextYear) || nextYear < 1000 || nextYear > 9999) return;
    const day = Math.min(new Date(`${selected}T12:00:00`).getDate(), new Date(nextYear, month, 0).getDate());
    year = nextYear;
    schedule = generateSchedule(year);
    selected = localDate(new Date(year, month - 1, day, 12));
    render();
}
const bookAbbreviations = {
    '창세기':'창','출애굽기':'출','레위기':'레','민수기':'민','신명기':'신','여호수아':'수','사사기':'삿','룻기':'룻','사무엘상':'삼상','사무엘하':'삼하','열왕기상':'왕상','열왕기하':'왕하','역대상':'대상','역대하':'대하','에스라':'스','느헤미야':'느','에스더':'에','욥기':'욥','시편':'시','골로새서':'골',
    '잠언': '잠', '전도서': '전', '아가': '아', '이사야': '사', '예레미야': '렘', '예레미야애가': '애', '에스겔': '겔', '다니엘': '단', '호세아': '호', '요엘': '욜', '아모스': '암', '오바댜': '옵', '요나': '욘', '미가': '미', '나훔': '나', '하박국': '합', '스바냐': '습', '학개': '학', '스가랴': '슥', '말라기': '말',
    '마태복음': '마', '마가복음': '막', '누가복음': '눅', '요한복음': '요', '사도행전': '행', '로마서': '롬', '고린도전서': '고전', '고린도후서': '고후', '갈라디아서': '갈', '에베소서': '엡', '빌립보서': '빌', '데살로니가전서': '살전', '데살로니가후서': '살후', '디모데전서': '딤전', '디모데후서': '딤후', '디도서': '딛', '빌레몬서': '몬', '히브리서': '히', '야고보서': '약', '베드로전서': '벧전', '베드로후서': '벧후', '요한일서': '요일', '요한이서': '요이', '요한삼서': '요삼', '유다서': '유', '요한계시록': '계'
};
const bookPattern = new RegExp(Object.keys(bookAbbreviations).sort((a, b) => b.length - a.length).join('|'), 'g');
const bibleBookCodes = {"창세기": "gen", "출애굽기": "exo", "레위기": "lev", "민수기": "num", "신명기": "deu", "여호수아": "jos", "사사기": "jdg", "룻기": "rut", "사무엘상": "1sa", "사무엘하": "2sa", "열왕기상": "1ki", "열왕기하": "2ki", "역대상": "1ch", "역대하": "2ch", "에스라": "ezr", "느헤미야": "neh", "에스더": "est", "욥기": "job", "시편": "psa", "잠언": "pro", "전도서": "ecc", "아가": "sng", "이사야": "isa", "예레미야": "jer", "예레미야애가": "lam", "에스겔": "ezk", "다니엘": "dan", "호세아": "hos", "요엘": "jol", "아모스": "amo", "오바댜": "oba", "요나": "jnh", "미가": "mic", "나훔": "nam", "하박국": "hab", "스바냐": "zep", "학개": "hag", "스가랴": "zec", "말라기": "mal", "마태복음": "mat", "마가복음": "mrk", "누가복음": "luk", "요한복음": "jhn", "사도행전": "act", "로마서": "rom", "고린도전서": "1co", "고린도후서": "2co", "갈라디아서": "gal", "에베소서": "eph", "빌립보서": "php", "골로새서": "col", "데살로니가전서": "1th", "데살로니가후서": "2th", "디모데전서": "1ti", "디모데후서": "2ti", "디도서": "tit", "빌레몬서": "phm", "히브리서": "heb", "야고보서": "jas", "베드로전서": "1pe", "베드로후서": "2pe", "요한1서": "1jn", "요한2서": "2jn", "요한3서": "3jn", "유다서": "jud", "요한계시록": "rev", "요한일서": "1jn", "요한이서": "2jn", "요한삼서": "3jn"};
function readingUrl(reading){
 if(!reading)return null;
 const first=reading.split(' · ')[0],book=Object.keys(bibleBookCodes).sort((a,b)=>b.length-a.length).find(name=>first.startsWith(name));
 if(!book)return null;
 const chapter=first.slice(book.length).match(/\d+/)?.[0]||'1';
 return `https://www.bskorea.or.kr/bible/korbibReadpage.php?version=GAE&book=${bibleBookCodes[book]}&chap=${chapter}&sec=1`;
}
function shortReading(reading) { return reading.replace(bookPattern, book => bookAbbreviations[book]).replace(/장/g, '').replace(/–/g, '-'); }
function copyText(date) { const d = new Date(`${date}T12:00:00`); return `${d.getMonth() + 1}/${d.getDate()}\n${schedule[date].replace(/–/g, '-')}`; }
async function writeClipboard(text) {
    if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(text); return; } catch { } }
    const active = document.activeElement, field = document.createElement('textarea'); field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
    try { if (!document.execCommand('copy')) throw new Error('Copy unavailable'); } finally { field.remove(); active?.focus(); }
}
function selectDate(date) { selected = date; render(); }
function render() {
    $('#year-select').value = year;
    $('#month-title').textContent = `${year}년 ${month}월`;
    $('#prev').disabled = month === 1; $('#next').disabled = month === 12;
    const tabs = $('.month-tabs'); tabs.replaceChildren();
    for (let m = 1; m <= 12; m++) { const button = document.createElement('button'); button.textContent = `${m}월`; button.className = m === month ? 'active' : ''; button.setAttribute('aria-pressed', String(m === month)); button.onclick = () => { month = m; render() }; tabs.append(button); }
    const grid = $('#calendar'); grid.replaceChildren();
    const first = new Date(year, month - 1, 1).getDay(), last = new Date(year, month, 0).getDate();
    const count = Math.ceil((first + last) / 7) * 7;
    for (let i = 0; i < count; i++) {
        const day = i - first + 1;
        if (day < 1 || day > last) { const blank = document.createElement('div'); blank.className = 'empty'; blank.setAttribute('aria-hidden', 'true'); grid.append(blank); continue; }
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, reading = schedule[date];
        const button = document.createElement('button'); button.className = ['day', !reading ? 'rest' : '', i % 7 === 0 ? 'sunday' : '', date === today ? 'today' : '', date === selected ? 'selected' : ''].join(' ');
        button.setAttribute('aria-label', `${month}월 ${day}일, ${reading || '지정 읽기 없음'}`); button.setAttribute('aria-pressed', String(date === selected)); if (date === today) button.setAttribute('aria-current', 'date');
        const number = document.createElement('span'); number.className = 'date-number'; number.textContent = day; button.append(number);
        const text = document.createElement('span'); text.className = 'day-reading'; text.textContent = reading ? shortReading(reading) : (i % 7 === 0 ? '주일' : '없음'); button.append(text);
        button.onclick = () => selectDate(date); grid.append(button);
    }
    const d = new Date(`${selected}T12:00:00`), reading = schedule[selected];
    $('#card-label').textContent = selected === today ? '오늘의 말씀' : '선택한 날의 말씀';
    $('#selected-date').textContent = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    $('#reading').textContent = reading || (d.getDay() === 0 ? '주일' : '없음');
    $('#schedule-note').hidden = false;
    $('#schedule-note').textContent = reading ? '하루 약 4장 · 책의 끝과 짧은 책에 맞춰 분량 조절 · 주일 제외' : (d.getDay() === 0 ? '주일에는 지정된 읽기 일정이 없습니다.' : '올해의 통독을 마쳤습니다. 지난 말씀을 돌아보세요.');
    const url = readingUrl(reading);
    $('#read-bible').disabled = !url;
    $('#read-bible').onclick = () => { if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
    $('#copy-reading').disabled = !reading;
    $('#copy-reading').textContent = selected === today ? '오늘 말씀 복사' : '선택한 말씀 복사';
    $('#copy-status').textContent = '';
}
$('#copy-reading').onclick = async () => {
    if (!schedule[selected]) return;
    const date = selected, button = $('#copy-reading'); button.disabled = true;
    try { await writeClipboard(copyText(date)); if (selected === date) $('#copy-status').textContent = '클립보드에 복사했습니다.'; }
    catch { if (selected === date) $('#copy-status').textContent = '복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.'; }
    finally { button.disabled = !schedule[selected]; }
};
$('#prev').onclick = () => { if (month > 1) { month--; render(); } }; $('#next').onclick = () => { if (month < 12) { month++; render(); } };
$('#year-select').onchange = (event) => {
    const value = Number(event.target.value);
    if (Number.isInteger(value) && value >= 1000 && value <= 9999) changeYear(value);
    else event.target.value = year;
};
$('#go-today').onclick = () => {
    const now = new Date(); today = localDate(now); selected = today;
    year = now.getFullYear(); month = now.getMonth() + 1;
    schedule = generateSchedule(year); render();
};
window.addEventListener('focus', () => {
    const current = localDate();
    if (current !== today) {
        const followingToday = selected === today; today = current;
        if (followingToday) $('#go-today').onclick(); else render();
    }
});
render();
if (document.modelContext?.registerTool) {
    const controller = new AbortController();
    try {
        Promise.resolve(document.modelContext.registerTool({
            name: 'select_bible_reading_date',
            description: 'Select a date in the annual Bible reading calendar and show its reading.',
            inputSchema: {type: 'object', properties: {date: {type: 'string', pattern: '^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$'}}, required: ['date'], additionalProperties: false},
            annotations: {readOnlyHint: false},
            execute(input) {
                const date = input?.date, parsed = new Date(`${date}T12:00:00`);
                if (typeof date !== 'string' || !/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(date) || Number.isNaN(parsed.getTime()) || localDate(parsed) !== date) throw new Error('Valid date required');
                year = parsed.getFullYear(); month = parsed.getMonth()+1; schedule = generateSchedule(year);
                selectDate(date); return {date, reading: schedule[date] || null};
            }
        }, {signal: controller.signal})).catch(() => {});
    } catch {}
    window.addEventListener('pagehide', () => controller.abort(), {once: true});
}
