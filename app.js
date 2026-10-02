const $ = (selector) => document.querySelector(selector);
function localDate(d=new Date()) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
let today=localDate(), selected=today, month=Math.min(12,Math.max(7,new Date().getMonth()+1));
const bookAbbreviations = {
 '잠언':'잠','전도서':'전','아가':'아','이사야':'사','예레미야':'렘','예레미야애가':'애','에스겔':'겔','다니엘':'단','호세아':'호','요엘':'욜','아모스':'암','오바댜':'옵','요나':'욘','미가':'미','나훔':'나','하박국':'합','스바냐':'습','학개':'학','스가랴':'슥','말라기':'말',
 '마태복음':'마','마가복음':'막','누가복음':'눅','요한복음':'요','사도행전':'행','로마서':'롬','고린도전서':'고전','고린도후서':'고후','갈라디아서':'갈','에베소서':'엡','빌립보서':'빌','데살로니가전서':'살전','데살로니가후서':'살후','디모데전서':'딤전','디모데후서':'딤후','디도서':'딛','빌레몬서':'몬','히브리서':'히','야고보서':'약','베드로전서':'벧전','베드로후서':'벧후','요한일서':'요일','요한이서':'요이','요한삼서':'요삼','유다서':'유','요한계시록':'계'
};
const bookPattern=new RegExp(Object.keys(bookAbbreviations).sort((a,b)=>b.length-a.length).join('|'),'g');
function shortReading(reading){return reading.replace(bookPattern,book=>bookAbbreviations[book]).replace(/장/g,'').replace(/–/g,'-');}
function copyText(date){const d=new Date(`${date}T12:00:00`);return `${d.getMonth()+1}/${d.getDate()}\n${schedule[date].replace(/–/g,'-')}`;}
async function writeClipboard(text){
 if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return;}catch{}}
 const active=document.activeElement,field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();
 try{if(!document.execCommand('copy'))throw new Error('Copy unavailable');}finally{field.remove();active?.focus();}
}
function selectDate(date) { selected=date; render(); }
function render() {
 $('#month-title').textContent=`2026년 ${month}월`;
 $('#prev').disabled=month===7; $('#next').disabled=month===12;
 const tabs=$('.month-tabs'); tabs.replaceChildren();
 for(let m=7;m<=12;m++){const button=document.createElement('button');button.textContent=`${m}월`;button.className=m===month?'active':'';button.setAttribute('aria-pressed',String(m===month));button.onclick=()=>{month=m;render()};tabs.append(button);}
 const grid=$('#calendar');grid.replaceChildren();
 const first=new Date(2026,month-1,1).getDay(),last=new Date(2026,month,0).getDate();
 const count=Math.ceil((first+last)/7)*7;
 for(let i=0;i<count;i++){
 const day=i-first+1;
 if(day<1||day>last){const blank=document.createElement('div');blank.className='empty';blank.setAttribute('aria-hidden','true');grid.append(blank);continue;}
 const date=`2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,reading=schedule[date];
 const button=document.createElement('button');button.className=['day',!reading?'rest':'',i%7===0?'sunday':'',date===today?'today':'',date===selected?'selected':''].join(' ');
 button.setAttribute('aria-label',`${month}월 ${day}일, ${reading||'지정 읽기 없음'}`);button.setAttribute('aria-pressed',String(date===selected));if(date===today)button.setAttribute('aria-current','date');
 const number=document.createElement('span');number.className='date-number';number.textContent=day;button.append(number);
 const text=document.createElement('span');text.className='day-reading';text.textContent=reading?shortReading(reading): (i%7===0?'주일':'—');button.append(text);
 button.onclick=()=>selectDate(date);grid.append(button);
 }
 const d=new Date(`${selected}T12:00:00`),reading=schedule[selected];
 $('#card-label').textContent=selected===today?'오늘의 말씀':'선택한 날의 말씀';
 $('#selected-date').textContent=d.toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
 $('#reading').textContent=reading||'지정된 읽기가 없어요';
 $('#day-description').textContent=reading?'말씀을 읽고, 마음에 남는 구절을 되새겨 보세요.':d.getDay()===0&&selected>='2026-07-01'&&selected<='2026-12-12'?'주일입니다. 한 주의 말씀을 돌아보세요.':'사진의 통독표에 읽기 일정이 없는 날입니다.';
 const note=selected==='2026-11-16'?'사진의 이날 표기가 모호합니다. 고린도후서 1–3장 · 갈라디아서 1–3장으로 옮겼으며 원본 확인이 필요합니다.':selected==='2026-12-12'?'사진에는 18–22장으로 적혀 있습니다. 전날의 17–20장과 겹치는 범위를 원본대로 표시했습니다.':'';
 $('#schedule-note').hidden=!note;$('#schedule-note').textContent=note;
 $('#copy-reading').disabled=!reading;
 $('#copy-reading').textContent=selected===today?'오늘 말씀 복사':'선택한 말씀 복사';
 $('#copy-status').textContent='';
}
$('#copy-reading').onclick=async()=>{
 if(!schedule[selected])return;
 const date=selected,button=$('#copy-reading');button.disabled=true;
 try{await writeClipboard(copyText(date));if(selected===date)$('#copy-status').textContent='클립보드에 복사했습니다.';}
 catch{if(selected===date)$('#copy-status').textContent='복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.';}
 finally{button.disabled=!schedule[selected];}
};
$('#prev').onclick=()=>{if(month>7){month--;render();}};$('#next').onclick=()=>{if(month<12){month++;render();}};
$('#go-today').onclick=()=>{today=localDate();selected=today;month=Math.min(12,Math.max(7,new Date().getMonth()+1));render();};
window.addEventListener('focus',()=>{const current=localDate();if(current!==today){if(selected===today)selected=current;today=current;render();}});
render();
if(document.modelContext?.registerTool){
 const controller=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({name:'select_bible_reading_date',description:'Select a date in the 2026 July–December Bible reading calendar and show its reading.',inputSchema:{type:'object',properties:{date:{type:'string',pattern:'^2026-(0[7-9]|1[0-2])-\\d{2}$'}},required:['date'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const date=input?.date;const parsed=new Date(`${date}T12:00:00`);if(typeof date!=='string'||!/^2026-(0[7-9]|1[0-2])-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||localDate(parsed)!==date)throw new Error('Valid July–December 2026 date required');month=parsed.getMonth()+1;selectDate(date);return {date,reading:schedule[date]||null};}},{signal:controller.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>controller.abort(),{once:true});
}
