/* Native PDF optional-content layers and document JavaScript.
   Full results remain visible in viewers without Acrobat JavaScript. */
function pdfAnimationProgram(animatedPages,frames=20,soundPage=-1,soundName="",soundPages=null,celebrationPage=-1){return `
var TDKdoc=this, TDKpages=${JSON.stringify(animatedPages)}, TDKframes=${frames};
var TDKsoundPage=${soundPage},TDKsoundName=${JSON.stringify(soundName)},TDKsounds=${JSON.stringify(soundPages||{[soundPage]:soundName})},TDKsound=null;
var TDKgroups={}, TDKtimer=null, TDKcurrent=-1, TDKstarted=0, TDKbefore=0, TDKshown=-1;
var TDKcelebrationPage=${celebrationPage};
var TDKdelay=${AFTER_DELAY}, TDKduration=${AFTER_DURATION};
var TDKocgs=TDKdoc.getOCGs()||[];
for(var TDKi=0;TDKi<TDKocgs.length;TDKi++)TDKgroups[TDKocgs[TDKi].name]=TDKocgs[TDKi];
function TDKcancel(){if(TDKsound){try{TDKsound.stop();}catch(e){}TDKsound=null;}if(TDKtimer!==null){try{app.clearTimeOut(TDKtimer);}catch(e){}TDKtimer=null;}}
function TDKframe(p,n){for(var k=1;k<=TDKframes;k++){var g=TDKgroups['TDK_PO_'+p+'_'+k];if(g)g.state=(k===n);}TDKshown=n;}
function TDKstart(p){TDKcancel();TDKcurrent=p;TDKbefore=(new Date()).getTime();TDKshown=-1;if(TDKpages.indexOf(p)<0){if(TDKsounds[p]){try{TDKsound=TDKdoc.getSound(TDKsounds[p]);if(TDKsound)TDKsound.play();}catch(e){}}return;}TDKframe(p,0);if(TDKsounds[p]){try{TDKsound=TDKdoc.getSound(TDKsounds[p]);if(TDKsound)TDKsound.play();}catch(e){}}if(TDKdelay>0)TDKtimer=app.setTimeOut('TDKbegin('+p+')',TDKdelay);else TDKbegin(p);}
function TDKbegin(p){if(TDKcurrent!==p||TDKdoc.pageNum!==p)return;var left=TDKdelay-((new Date()).getTime()-TDKbefore);if(left>0){TDKtimer=app.setTimeOut('TDKbegin('+p+')',left);return;}TDKstarted=(new Date()).getTime();TDKtick(p);}
function TDKtick(p){if(TDKcurrent!==p||TDKdoc.pageNum!==p)return;var t=Math.min(1,((new Date()).getTime()-TDKstarted)/(TDKduration+(p===TDKcelebrationPage?700:0)));var frame=Math.min(TDKframes,Math.max(1,Math.floor(t*TDKframes)+1));if(frame!==TDKshown)TDKframe(p,frame);if(t<1)TDKtimer=app.setTimeOut('TDKtick('+p+')',70);else TDKtimer=null;}
function TDKleave(p){if(TDKcurrent===p)TDKcancel();}
function TDKall(){TDKcancel();for(var j=0;j<TDKpages.length;j++)TDKframe(TDKpages[j],TDKframes);}
`;}
async function createInteractivePDF(defs,onProgress=()=>{}){
 const {PDFDocument,PDFName,PDFString,PDFHexString,PDFOperator,StandardFonts,rgb}=PDFLib;
 const pdf=await PDFDocument.create(),m=meta(),context=pdf.context,frames=20;
 pdf.setTitle(`${m.title} — ${m.school}, ${m.city}, ${m.date}`);pdf.setSubject('Interaktywny raport PRZED i PO — Tour de Konstytucja PLUS');pdf.setLanguage('pl-PL');pdf.setCreator('Raport quizów — Tour de Konstytucja PLUS');
 const soundPages=Object.fromEntries(defs.map((def,i)=>[i,slideSoundName(def)]).filter(([,name])=>name)),soundEntries=[];
 for(const name of [...new Set(Object.values(soundPages))].sort()){
  const response=await fetch('assets/'+name+'.pcm?v=20261017-2');if(!response.ok)throw Error('Nie udało się wczytać dźwięku raportu.');
  const pcm=new Uint8Array(await response.arrayBuffer());const sound=context.register(context.flateStream(pcm,{Type:'Sound',R:22050,C:1,B:16,E:'Signed'}));soundEntries.push(PDFString.of(name),sound);
 }
 if(soundEntries.length)pdf.catalog.set(PDFName.of('Names'),context.obj({Sounds:{Names:soundEntries}}));
 const smallFont=await pdf.embedFont(StandardFonts.HelveticaBold),pages=[],allLayers=[],defaultOn=[],defaultOff=[],animated=[];
 const color=hex=>{const n=parseInt(hex.slice(1),16);return rgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255);};
 for(let i=0;i<defs.length;i++){
  const def=defs[i],page=pdf.addPage([W,H]);pages.push(page);onProgress(i+1,defs.length);
  const base=draw(def,i+1,1.8,def.type==='cover'?1:0),img=await pdf.embedJpg(base.toDataURL('image/jpeg',.96));page.drawImage(img,{x:0,y:0,width:W,height:H});
  if(def.type==='cover'){page.node.set(PDFName.of('AA'),context.obj({O:{S:'JavaScript',JS:PDFString.of('TDKstart('+i+');')},C:{S:'JavaScript',JS:PDFString.of('TDKleave('+i+');')}}));continue;}
  animated.push(i);const overlay=afterOverlay(def),finalImage=await pdf.embedPng(overlay.canvas.toDataURL('image/png'));
  const properties=context.obj({});page.node.Resources().set(PDFName.of('Properties'),properties);
  for(let frame=1;frame<=frames;frame++){
   const layer=context.register(context.obj({Type:'OCG',Name:PDFString.of(`TDK_PO_${i}_${frame}`),Intent:'View',Usage:{Print:{PrintState:frame===frames?'ON':'OFF'}}}));
   allLayers.push(layer);(frame===frames?defaultOn:defaultOff).push(layer);const resource=PDFName.of('PO'+frame);properties.set(resource,layer);
   page.pushOperators(PDFOperator.of('BDC',[PDFName.of('OC'),resource]));
   if(frame===frames||def.type==='summary'&&result.summary.after>90){const elapsed=(frame-1)/(frames-1)*(AFTER_DURATION+700),partial=frame===frames?null:afterOverlay(def,1-Math.pow(1-Math.min(1,elapsed/AFTER_DURATION),3),Math.max(0,Math.min(1,(elapsed-AFTER_DURATION)/700))),frameImage=partial?await pdf.embedPng(partial.canvas.toDataURL('image/png')):finalImage;const b=overlay.bounds;page.drawImage(frameImage,{x:b.x,y:H-b.y-b.h,width:b.w,height:b.h});}
   else{const p=1-Math.pow(1-(frame-1)/(frames-1),3);afterGeometry(def,p).forEach(g=>{if(g.w>0&&g.h>0)page.drawRectangle({x:g.x,y:H-g.y-g.h,width:g.w,height:g.h,color:color(g.color)});page.drawText(g.label,{x:g.lx,y:H-g.ly,size:def.type==='question'?11:16,font:smallFont,color:color(C.after)});});}
   page.pushOperators(PDFOperator.of('EMC',[]));
  }
  const open=context.register(context.obj({Type:'Action',S:'JavaScript',JS:PDFString.of(`TDKstart(${i});`)})),close=context.register(context.obj({Type:'Action',S:'JavaScript',JS:PDFString.of(`TDKleave(${i});`)}));
  page.node.set(PDFName.of('AA'),context.obj({O:open,C:close}));
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 pdf.catalog.set(PDFName.of('OCProperties'),context.obj({OCGs:allLayers,D:{Name:PDFHexString.fromText('Wyniki PO'),BaseState:'OFF',ON:defaultOn,OFF:defaultOff,Order:[],AS:[{Event:'Print',Category:['Print'],OCGs:allLayers}]}}));
 pdf.addJavaScript('TdKQuizAnimation',pdfAnimationProgram(animated,frames,-1,"",soundPages,result.summary.after>90?defs.findIndex(d=>d.type==='summary'):-1));
 pdf.catalog.set(PDFName.of('OpenAction'),context.obj([pages[0].ref,PDFName.of('Fit')]));pdf.catalog.set(PDFName.of('PageLayout'),PDFName.of('SinglePage'));
 pdf.catalog.set(PDFName.of('AA'),context.obj({WP:{S:'JavaScript',JS:PDFString.of('TDKall();')},WC:{S:'JavaScript',JS:PDFString.of('TDKcancel();')}}));
 const link=(page,rect,action)=>{const annot=context.register(context.obj({Type:'Annot',Subtype:'Link',Rect:rect,Border:[0,0,0],H:'I',A:action}));page.node.addAnnot(annot);};
 pages.forEach((page,i)=>{
  const go=j=>context.obj({S:'GoTo',D:[pages[j].ref,PDFName.of('Fit')]});
  if(i>0){link(page,[688,0,817,18],go(i-1));link(page,[825,0,950,18],go(0));link(page,[955,0,1100,18],context.obj({S:'JavaScript',JS:PDFString.of(`TDKstart(${i});`)}));}
  if(i<pages.length-1)link(page,[1105,0,1247,18],go(i+1));
 });
 return pdf.save({useObjectStreams:false});
}
