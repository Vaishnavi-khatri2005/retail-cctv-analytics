import fs from 'node:fs/promises';

let n = 1;
const elements = [];
const id = () => `rv-${n++}`;
const base = (type, x, y, width, height) => ({ id:id(), type, x, y, width, height, angle:0, strokeColor:'#1e3a5f', backgroundColor:'#ffffff', fillStyle:'solid', strokeWidth:2, strokeStyle:'solid', roughness:1, opacity:100, groupIds:[], frameId:null, roundness:{type:3}, seed:n*101, version:1, versionNonce:n*1009, isDeleted:false, boundElements:null, updated:1, link:null, locked:false });
function box(x,y,w,h,label,color='#DCE6F1') { const r=base('rectangle',x,y,w,h); r.backgroundColor=color; elements.push(r); const t=base('text',x+12,y+h/2-10,w-24,20); Object.assign(t,{text:label,originalText:label,fontSize:18,fontFamily:2,textAlign:'center',verticalAlign:'middle',containerId:r.id,autoResize:true,lineHeight:1.25,baseline:16,strokeColor:'#172B4D'}); elements.push(t); r.boundElements=[{id:t.id,type:'text'}]; return r; }
function note(x,y,text) { const t=base('text',x,y,600,24); Object.assign(t,{text,originalText:text,fontSize:16,fontFamily:2,textAlign:'left',verticalAlign:'top',autoResize:true,lineHeight:1.25,baseline:15,strokeColor:'#475569'}); elements.push(t); }
function arrow(a,b,label='') { const x=a.x+a.width, y=a.y+a.height/2, tx=b.x, ty=b.y+b.height/2; const ar=base('arrow',x,y,tx-x,ty-y); Object.assign(ar,{points:[[0,0],[tx-x,ty-y]],endArrowhead:'arrow',startArrowhead:null,roundness:{type:2},backgroundColor:'transparent',boundElements:null,startBinding:{elementId:a.id,focus:0,gap:1},endBinding:{elementId:b.id,focus:0,gap:1}}); elements.push(ar); if(label) note((x+tx)/2-20,(y+ty)/2-28,label); }
function frame(x,y,title,subtitle) { const f=base('frame',x,y,1220,360); Object.assign(f,{name:title,backgroundColor:'#ffffff',strokeColor:'#94A3B8',fillStyle:'solid',strokeWidth:1,roundness:null}); elements.push(f); const h=base('text',x+24,y+18,800,28); Object.assign(h,{text:title,originalText:title,fontSize:24,fontFamily:1,fontWeight:700,textAlign:'left',verticalAlign:'top',autoResize:true,lineHeight:1.25,baseline:22,strokeColor:'#0F172A'}); elements.push(h); note(x+24,y+55,subtitle); return f; }

frame(0,0,'RetailVision AI | System Overview','From CCTV upload to annotated stream, analytics, and manager action');
const a=box(55,140,165,74,'CCTV Footage','#E0F2FE'); const b=box(285,140,165,74,'Upload API','#DBEAFE'); const c=box(515,140,185,74,'OpenCV Processing','#D1FAE5'); const d=box(765,75,175,74,'SQLite Event Store','#FEF3C7'); const e=box(765,210,175,74,'Annotated MP4','#FCE7F3'); const f=box(1000,140,175,74,'Next.js Dashboard','#EDE9FE'); arrow(a,b); arrow(b,c); arrow(c,d,'events'); arrow(c,e,'processed video'); arrow(d,f); arrow(e,f);

frame(0,430,'Module 1 | Video Ingestion','Validates a submitted clip, stores its metadata, and starts asynchronous processing.');
const m1a=box(55,570,175,70,'Manager uploads MP4 / AVI','#E0F2FE'); const m1b=box(300,570,175,70,'POST /api/videos/upload','#DBEAFE'); const m1c=box(545,570,175,70,'Save file to uploads/','#D1FAE5'); const m1d=box(790,570,175,70,'Create Video record','#FEF3C7'); const m1e=box(1035,570,145,70,'Queue process_video','#FCE7F3'); arrow(m1a,m1b); arrow(m1b,m1c); arrow(m1c,m1d); arrow(m1d,m1e);

frame(0,860,'Module 2 | Computer Vision Processing','Uses MOG2 background subtraction, contour filtering, overlays, and event generation.');
const m2a=box(45,1010,155,70,'Read video frame','#E0F2FE'); const m2b=box(250,1010,185,70,'MOG2 foreground mask','#DBEAFE'); const m2c=box(485,1010,185,70,'Contour area > 2000 px²','#D1FAE5'); const m2d=box(720,1010,175,70,'Draw bounding box','#FEF3C7'); const m2e=box(945,1010,185,70,'Write annotated frame','#FCE7F3'); arrow(m2a,m2b); arrow(m2b,m2c); arrow(m2c,m2d); arrow(m2d,m2e);

frame(0,1290,'Module 3 | Zone & Intrusion Monitoring','Determines whether detected motion crosses the configured restricted-side boundary.');
const m3a=box(60,1440,170,70,'Detection center point','#E0F2FE'); const m3b=box(315,1440,170,70,'Compare with zone threshold','#DBEAFE'); const m3c=box(570,1370,170,70,'Restricted zone?','#FEF3C7'); const m3d=box(825,1370,170,70,'Create alert event','#FECACA'); const m3e=box(825,1510,170,70,'Create info event','#D1FAE5'); arrow(m3a,m3b); arrow(m3b,m3c); arrow(m3c,m3d,'Yes'); const ar=base('arrow',m3c.x+m3c.width,m3c.y+m3c.height/2,m3e.x-(m3c.x+m3c.width),m3e.y+m3e.height/2-(m3c.y+m3c.height/2)); Object.assign(ar,{points:[[0,0],[255,105]],endArrowhead:'arrow',backgroundColor:'transparent'}); elements.push(ar); note(755,1495,'No');

frame(0,1720,'Module 4 | Footfall Analytics','Aggregates hourly visitor volume for operational planning and dashboard reporting.');
const m4a=box(75,1870,180,70,'Events / detections','#E0F2FE'); const m4b=box(350,1870,180,70,'Aggregate by hour','#DBEAFE'); const m4c=box(625,1870,180,70,'GET /api/analytics/footfall','#D1FAE5'); const m4d=box(900,1870,180,70,'Area + line charts','#EDE9FE'); arrow(m4a,m4b); arrow(m4b,m4c); arrow(m4c,m4d);

frame(0,2150,'Module 5 | Alerts & Investigation','Makes security-relevant events visible, assigns an owner, and records resolution.');
const m5a=box(60,2300,180,70,'Event record','#FECACA'); const m5b=box(335,2300,180,70,'GET /api/events','#DBEAFE'); const m5c=box(610,2300,180,70,'Recent Events panel','#FEF3C7'); const m5d=box(885,2300,180,70,'Investigate & resolve','#D1FAE5'); arrow(m5a,m5b); arrow(m5b,m5c); arrow(m5c,m5d);

frame(0,2580,'Module 6 | Dashboard & Video Playback','Provides a live management view and returns completed processed video on request.');
const m6a=box(55,2730,175,70,'GET /api/videos','#E0F2FE'); const m6b=box(305,2730,175,70,'Select completed video','#DBEAFE'); const m6c=box(555,2730,190,70,'GET /api/videos/{id}/stream','#D1FAE5'); const m6d=box(820,2730,175,70,'VideoPlayer','#EDE9FE'); const m6e=box(1065,2730,100,70,'Manager','#FEF3C7'); arrow(m6a,m6b); arrow(m6b,m6c); arrow(m6c,m6d); arrow(m6d,m6e);

const doc={type:'excalidraw',version:2,source:'https://excalidraw.com',elements,appState:{gridSize:null,viewBackgroundColor:'#ffffff'},files:{}};
await fs.mkdir('C:/Users/A/OneDrive/Desktop/retail-cctv-analytics/excalidraw',{recursive:true});
await fs.writeFile('C:/Users/A/OneDrive/Desktop/retail-cctv-analytics/excalidraw/RetailVision_AI_Modules.excalidraw',JSON.stringify(doc,null,2));
