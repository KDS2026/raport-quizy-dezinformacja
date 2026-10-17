/* Paleta W1–W4 i oryginalne kolaże z czterech prezentacji warsztatowych. */
const W=1280,H=720,C={ink:'#171717',red:'#c62828',before:'#315f9a',after:'#23734e',paper:'#ffffff',muted:'#565656',yellow:'#f1d66b',blue:'#245c99'};
const THEMES={W1:{code:'W1',name:'EMOCJE',color:'#c62828',dark:'#9c1f1f',on:'#ffffff',art:'cover'},W2:{code:'W2',name:'MÓZG IDZIE NA SKRÓTY',color:'#f1d66b',dark:'#87670c',on:'#171717',art:'w2'},W3:{code:'W3',name:'PRZEKAZ',color:'#23664c',dark:'#174632',on:'#ffffff',art:'w3'},W4:{code:'W4',name:'W SIECI INFORMACJI',color:'#245c99',dark:'#173f70',on:'#ffffff',art:'w4'}};
const QUESTION_WORKSHOP={q1:'W1',q2:'W2',q3:'W2',q4:'W3',q5:'W3',q6:'W4',q7:'W4'};
const QUESTION_COLORS=['W1','W2','W3','W4'];
const AFTER_DELAY=6000,AFTER_DURATION=1800;
const chart={top:164,rowH:91,x:520,width:435,height:19,afterOffset:49};
const summaryChart={x:655,width:176,bottom:480,height:310};
const art={},logoImage=new Image(),coverImage=new Image();
const images=[['cover','assets/workshop-cover.png'],...Array.from({length:7},(_,i)=>['q'+(i+1),'assets/art-q'+(i+1)+'.png']),...['w2','w3','w4'].map(k=>[k,'assets/art-'+k+'.png'])];
let brandingLoaded=false,brandingFailure=null,brandingLoading=false;
function loadBranding(){
 brandingLoaded=false;brandingFailure=null;brandingLoading=true;
 const tasks=[{img:logoImage,src:'assets/project-logos.png'},...images.map(([key,src])=>{const img=art[key]||(key==='cover'?coverImage:new Image());art[key]=img;return{img,src};})];
 return Promise.allSettled(tasks.map(({img,src})=>new Promise((resolve,reject)=>{
  let attempt=0;
  function begin(){img.onload=()=>resolve();img.onerror=()=>{if(attempt<2){attempt++;setTimeout(begin,attempt*500);}else reject(Error('Nie udało się wczytać grafiki '+src));};img.src=src+'?load='+Date.now()+'-'+attempt;}
  begin();
 }))).then(results=>{const failure=results.find(r=>r.status==='rejected');brandingLoading=false;brandingLoaded=!failure;brandingFailure=failure?failure.reason:null;return brandingLoaded;});
}
let brandingReady=loadBranding();

function mode(){return document.getElementById('workshopTheme')?.value||'MIX';}
function currentTheme(q=null){if(q){const content=THEMES[mode()]||THEMES[QUESTION_WORKSHOP[q.id]]||THEMES.W1;const position=result?.questions.filter(item=>item.include).findIndex(item=>item.id===q.id)??(q.number-1);const palette=THEMES[QUESTION_COLORS[Math.max(0,position)%QUESTION_COLORS.length]];return {...content,color:palette.color,dark:palette.dark,on:palette.on};}return THEMES[mode()]||THEMES.W1;}
function wrap(ctx,value,width){let line='';const lines=[];for(const word of String(value).split(/\s+/)){if(ctx.measureText(line?line+' '+word:word).width>width&&line){lines.push(line);line=word;}else line=line?line+' '+word:word;}if(line)lines.push(line);return lines;}
function font(ctx,size,bold=false,display=false){ctx.font=`${bold?'700':'400'} ${size}px ${display?'WorkshopDisplay,"Arial Narrow",':' '}Arial,Helvetica,sans-serif`;}
function fit(ctx,value,width,height,size,min=13,bold=false,display=false){let lines;for(;size>=min;size--){font(ctx,size,bold,display);lines=wrap(ctx,value,width);if(lines.length*size*1.22<=height)return {lines,size};}return{lines,size:min};}
function text(ctx,value,x,y,width,size=20,bold=false,color=C.ink,display=false){font(ctx,size,bold,display);ctx.fillStyle=color;const lines=wrap(ctx,value,width);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*size*1.22));return lines.length*size*1.22;}
function canvas(scale=1){const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;c.setAttribute('role','img');const ctx=c.getContext('2d');ctx.scale(scale,scale);ctx.textBaseline='alphabetic';return{c,ctx};}
function datePL(s){if(!s)return '';return new Date(s+'T12:00:00').toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'});}
function drawArt(ctx,key,x,y,w,h){const img=art[key];if(!img)return;const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);}
function fourColors(ctx,y,height){Object.values(THEMES).forEach((t,i)=>{ctx.fillStyle=t.color;ctx.fillRect(i*W/4,y,W/4,height);});}
function logos(ctx){
 ctx.fillStyle='#fff';ctx.fillRect(20,604,1240,82);
 const parts=[{s:[125,72,936,521],cx:185,maxW:170},{s:[1129,172,1079,320],cx:640,maxW:310},{s:[2340,122,636,418],cx:1095,maxW:145}];
 parts.forEach(({s,cx,maxW})=>{const scale=Math.min(maxW/s[2],65/s[3]),w=s[2]*scale,h=s[3]*scale;ctx.drawImage(logoImage,...s,cx-w/2,612+(65-h)/2,w,h);});
}
function footer(ctx,index,type='question',theme=currentTheme()){
 const label=fit(ctx,`${meta().school} · ${meta().city} · ${meta().date}`,620,14,11,9);font(ctx,label.size);ctx.fillStyle=C.muted;ctx.fillText(label.lines[0]||'',42,706);
 const nav=type==='cover'?[['DALEJ →',1130]]:[['← WSTECZ',698],['OKŁADKA',836],['POWTÓRZ',967],['DALEJ →',1125]];
 nav.filter(([s])=>(type!=='summary'||s!=='DALEJ →')&&!(type==='summary'&&ctx.canvas.dataset.viewerSummary==='true')).forEach(([s,x])=>text(ctx,s,x,716,150,9,false,'#000000',true));
 ctx.textAlign='right';text(ctx,String(index).padStart(2,'0'),1240,23,70,12,true,type==='question'?theme.on:C.ink);ctx.textAlign='left';
 if(state.demo)text(ctx,'PRZYKŁAD · DANE FIKCYJNE',42,type==='summary'?36:19,700,10,true,type==='question'?theme.on:type==='cover'&&mode()!=='MIX'?theme.on:C.red);
}
function drawCover(ctx){const m=meta(),mixed=mode()==='MIX',t=currentTheme();ctx.fillStyle=mixed?'#ffffff':t.color;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,598,W,122);
 text(ctx,'WARSZTATY · RAPORT PRZED I PO',44,55,1100,17,true,mixed?C.ink:t.on,true);
 if(mixed){const title=fit(ctx,(m.title||'Warsztaty o dezinformacji').toUpperCase(),1185,100,65,34,true,true);title.lines.forEach((l,i)=>text(ctx,l,42,115+i*title.size*1.05,1185,title.size,true,C.ink,true));text(ctx,m.subtitle,44,185,1185,23,true);
  Object.values(THEMES).forEach((theme,i)=>{const x=i*320;ctx.fillStyle=theme.color;ctx.fillRect(x,205,320,280);drawArt(ctx,theme.art,x+23,218,274,212);const label=fit(ctx,theme.name,276,54,22,15,true,true);label.lines.forEach((line,j)=>text(ctx,line,x+22,450+j*label.size*1.15,276,label.size,true,theme.on,true));});
 }else{let title=fit(ctx,(m.title||'Warsztaty o dezinformacji').toUpperCase(),850,175,76,35,true,true);title.lines.forEach((l,i)=>text(ctx,l,42,138+i*title.size*1.05,850,title.size,true,t.on,true));text(ctx,m.subtitle,44,320,820,26,true,t.on);text(ctx,t.name,44,377,800,24,true,t.on,true);drawArt(ctx,t.art,920,80,310,440);}
 const school=fit(ctx,m.school,mixed?1190:850,64,28,17,true);school.lines.forEach((l,i)=>text(ctx,l,44,530+i*school.size*1.2,mixed?1190:850,school.size,true,mixed?C.ink:t.on));text(ctx,`${m.city} · ${datePL(m.date)}`,44,590,1180,20,false,mixed?C.ink:t.on);logos(ctx);footer(ctx,1,'cover',t);
}
function barColor(q,oi,fi){const s=q.sides[fi],ratio=s.answered?s.counts[oi]/s.answered:0;if(oi===q.correct)return fi&&ratio===1?'#c59b19':fi?C.after:C.before;return ratio>.3?'#d62b26':fi?'#8d9499':C.ink;}
function paintQuestionAfter(ctx,q,progress=1){if(progress<=0)return;const {top,rowH,x,width,height,afterOffset}=chart;q.options.forEach((_,oi)=>{const s=q.sides[1],count=s.counts[oi],ratio=s.answered?count/s.answered:0,yy=top+oi*rowH+afterOffset,w=width*ratio*progress,col=barColor(q,oi,1);ctx.fillStyle=col;ctx.fillRect(x,yy,w,height);text(ctx,'PO',473,yy+14,45,11,true,C.after);const shown=Math.round(count*progress),p=s.answered?shown/s.answered*100:0;text(ctx,`${shown} (${percent(p)})${oi===q.correct&&ratio===1&&progress>=1?'  👑':''}`,x+w+8,yy+14,150,14,true,col);});text(ctx,`PO: n=${q.sides[1].answered}`,830,572,220,12,false,C.muted);}
function drawQuestion(ctx,q,index,progress=1){const t=currentTheme(q);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle=t.color;ctx.fillRect(0,0,W,140);ctx.fillRect(0,140,12,460);
 text(ctx,String(q.number).padStart(2,'0'),42,90,90,58,true,t.on,true);const title=fit(ctx,q.question.toUpperCase(),1070,80,35,24,true,true);title.lines.forEach((l,i)=>text(ctx,l,140,52+i*title.size*1.12,1070,title.size,true,t.on,true));text(ctx,t.code+' · '+t.name,142,124,950,15,true,t.on,true);
 const {top,rowH,x,width,height}=chart;ctx.lineWidth=1;ctx.strokeStyle='#d5dce3';for(let i=0;i<=5;i++){const xx=x+width*i/5;ctx.beginPath();ctx.moveTo(xx,top);ctx.lineTo(xx,top+rowH*4-4);ctx.stroke();text(ctx,i*20+'%',xx-12,548,70,11,false,C.muted);}
 q.options.forEach((o,oi)=>{const y=top+oi*rowH,correct=oi===q.correct;if(correct){ctx.fillStyle='#eef5fa';ctx.fillRect(39,y+2,420,rowH-7);ctx.fillStyle=t.color;ctx.fillRect(39,y+2,6,rowH-7);}text(ctx,L[oi],55,y+47,36,28,true,t.dark,true);const tx=fit(ctx,o,328,rowH-11,21,15,correct);tx.lines.forEach((l,i)=>text(ctx,l,97,y+rowH/2-(tx.lines.length-1)*tx.size*.61+tx.size*.3+i*tx.size*1.22,328,tx.size,correct));if(correct)text(ctx,'✓',437,y+21,24,15,true,C.after);
 const s=q.sides[0],ratio=s.answered?s.counts[oi]/s.answered:0,yy=y+14,w=width*ratio,col=barColor(q,oi,0);ctx.fillStyle=col;ctx.fillRect(x,yy,w,height);text(ctx,'PRZED',470,yy+14,50,10,true,C.before);text(ctx,`${s.counts[oi]} (${percent(ratio*100)})`,x+w+8,yy+14,150,14,true,col);
 });drawArt(ctx,q.id,1080,183,178,332);text(ctx,`PRZED: n=${q.sides[0].answered}`,44,572,300,12,false,C.muted);paintQuestionAfter(ctx,q,progress);logos(ctx);footer(ctx,index,'question',t);
}
function paintSummaryAfter(ctx,progress=1,crownProgress=1){if(progress<=0)return;const s=result.summary,g=summaryChart,val=s.after*progress,height=g.height*val/100;const down=s.after<s.before,gold=!down&&s.after>90&&progress>=1;const barColor=down&&progress>=.9?'#c62828':gold?'#c59b19':C.after;ctx.fillStyle=barColor;ctx.fillRect(g.x,g.bottom-height,g.width,height);text(ctx,percent(val),g.x,g.bottom-height-15,250,36,true,barColor,true);text(ctx,'PO WARSZTACIE',g.x,g.bottom+27,270,18,true,C.ink,true);if(gold)drawSummaryCrown(ctx,g.x+g.width/2,g.bottom-height+42-100*(1-crownProgress),crownProgress);if(progress>=1){text(ctx,(s.delta>0?'+':'')+fmt(s.delta),990,275,240,60,true,s.delta>=0?C.after:'#c62828',true);text(ctx,'punktów procentowych',984,314,260,17);}}
function drawSummary(ctx,index,progress=1,crownProgress=1){const s=result.summary;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);fourColors(ctx,0,17);text(ctx,'CO ZMIENIŁO SIĘ PO WARSZTACIE?',44,81,1170,45,true,C.ink,true);text(ctx,`Średni odsetek poprawnych odpowiedzi · ${s.k} pytań`,44,119,1170,19,false,C.muted);
 const g=summaryChart;ctx.strokeStyle='#d5dce3';for(let i=0;i<=5;i++){const yy=g.bottom-g.height*i/5;ctx.beginPath();ctx.moveTo(145,yy);ctx.lineTo(928,yy);ctx.stroke();text(ctx,i*20+'%',91,yy+4,70,12,false,C.muted);}const h=g.height*s.before/100;ctx.fillStyle=C.before;ctx.fillRect(268,g.bottom-h,176,h);text(ctx,percent(s.before),268,g.bottom-h-15,270,36,true,C.before,true);text(ctx,'PRZED WARSZTATEM',254,g.bottom+27,310,18,true,C.ink,true);drawArt(ctx,'w4',1062,344,178,196);paintSummaryAfter(ctx,progress,crownProgress);text(ctx,'Porównanie wyników grup. Zmiana nie oznacza postępu każdej pojedynczej osoby.',44,573,1170,14,false,C.muted);logos(ctx);footer(ctx,index,'summary');}
function afterGeometry(def,progress){if(def.type==='question')return def.q.options.map((_,oi)=>{const s=def.q.sides[1],ratio=s.answered?s.counts[oi]/s.answered:0;return{x:chart.x,y:chart.top+oi*chart.rowH+chart.afterOffset,w:chart.width*ratio*progress,h:chart.height,color:barColor(def.q,oi,1),label:'PO',lx:473,ly:chart.top+oi*chart.rowH+chart.afterOffset+14};});const g=summaryChart;return[{x:g.x,y:g.bottom-g.height*result.summary.after/100*progress,w:g.width,h:g.height*result.summary.after/100*progress,color:result.summary.after<result.summary.before&&progress>=.9?'#c62828':C.after,label:'PO WARSZTACIE',lx:g.x,ly:g.bottom+27}];}
function afterOverlay(def,progress=1,crownProgress=1){const {c,ctx}=canvas(1.5);if(def.type==='question')paintQuestionAfter(ctx,def.q,1);else paintSummaryAfter(ctx,progress,crownProgress);const bounds=def.type==='question'?{x:468,y:chart.top,w:812,h:430}:{x:640,y:126,w:640,h:450};const crop=document.createElement('canvas');crop.width=bounds.w*1.5;crop.height=bounds.h*1.5;crop.getContext('2d').drawImage(c,bounds.x*1.5,bounds.y*1.5,crop.width,crop.height,0,0,crop.width,crop.height);return{canvas:crop,bounds};}

function slideSoundName(def){
 if(def.type==='cover')return 'cover-intro';
 const delta=def.type==='summary'?result.summary.delta:def.q.sides[1].percent-def.q.sides[0].percent;
 const before=def.type==='summary'?result.summary.before:def.q.sides[0].percent;
 const after=def.type==='summary'?result.summary.after:def.q.sides[1].percent;
 if(Math.abs(before-100)<1e-9&&Math.abs(after-100)<1e-9)return (def.type==='summary'?'report-':'question-')+'up';
 if(Math.abs(delta)<1e-9)return 'result-same';
 return (def.type==='summary'?'report-':'question-')+(delta>0?'up':'down');
}

function drawSummaryCrown(ctx,x,y,progress){if(progress<=0)return;ctx.save();ctx.translate(x,y);ctx.fillStyle='#f1d66b';ctx.strokeStyle='#87670c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,8);ctx.lineTo(-34,-17);ctx.lineTo(-15,-5);ctx.lineTo(0,-27);ctx.lineTo(15,-5);ctx.lineTo(34,-17);ctx.lineTo(28,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(-28,11,56,7);ctx.restore();}
