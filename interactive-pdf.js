/* Static PDF export. The animated browser presentation is independent. */
async function createStaticPDF(defs,onProgress=()=>{}){
 const {PDFDocument}=PDFLib,pdf=await PDFDocument.create(),m=meta();
 pdf.setTitle(`${m.title} — ${m.school}, ${m.city}, ${m.date}`);
 pdf.setSubject('Wyniki quizu PRZED i PO — Tour de Konstytucja PLUS');
 pdf.setLanguage('pl-PL');pdf.setCreator('Raport quizów — Tour de Konstytucja PLUS');
 for(let i=0;i<defs.length;i++){
  onProgress(i+1,defs.length);
  const rendered=draw(defs[i],i+1,1.8,1),ctx=rendered.getContext('2d');
  // Navigation belongs to the live presentation, not to the exported document.
  ctx.fillStyle='#ffffff';ctx.fillRect(688,702,W-688,18);
  const image=await pdf.embedJpg(rendered.toDataURL('image/jpeg',.96));
  pdf.addPage([W,H]).drawImage(image,{x:0,y:0,width:W,height:H});
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 return pdf.save({useObjectStreams:false});
}
