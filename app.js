(()=>{'use strict';
const backdrop=document.getElementById('dialogBackdrop'),title=document.getElementById('dialogTitle'),desc=document.getElementById('dialogText'),close=document.getElementById('closeDialog');
let lastFocus=null,ctx=null,soundOn=false,ambient=null;
const AC=window.AudioContext||window.webkitAudioContext;
function audio(){if(!AC)return null;ctx=ctx||new AC();if(ctx.state==='suspended')ctx.resume();return ctx}
function tone(c,start,duration,f0,f1,volume,type='sawtooth'){
 const o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;
 o.type=type;o.frequency.setValueAtTime(Math.max(1,f0),start);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),start+duration);
 g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+Math.min(.12,duration*.2));g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 o.connect(filter).connect(g).connect(c.destination);o.start(start);o.stop(start+duration+.02)
}
function noise(c,start,duration,volume,highpass=90){
 const sr=c.sampleRate,buf=c.createBuffer(1,Math.ceil(sr*duration),sr),data=buf.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
 const source=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();source.buffer=buf;f.type='highpass';f.frequency.value=highpass;
 g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(volume,start+duration*.3);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(f).connect(g).connect(c.destination);source.start(start);source.stop(start+duration)
}
function launch(){const c=audio();if(!c)return;const t=c.currentTime+.04;
 tone(c,t,1.6,47,78,.075);tone(c,t+.12,1.9,94,165,.04,'triangle');
 noise(c,t+.18,1.9,.055,55);tone(c,t+.9,1.25,220,660,.026,'sine');tone(c,t+1.35,1.1,330,880,.017,'sine')
}
function confirm(){const c=audio();if(!c)return;const t=c.currentTime+.02;
 tone(c,t,.45,145,290,.045,'triangle');tone(c,t+.15,.7,290,580,.035,'sine');noise(c,t,.55,.018,450)
}
function startAmbient(){const c=audio();if(!c||ambient)return;const master=c.createGain(),o1=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lfoGain=c.createGain();
 master.gain.setValueAtTime(.0001,c.currentTime);master.gain.linearRampToValueAtTime(.018,c.currentTime+2);
 o1.type='sine';o1.frequency.value=55;o2.type='triangle';o2.frequency.value=82.41;
 lfo.frequency.value=.11;lfoGain.gain.value=.007;lfo.connect(lfoGain).connect(master.gain);
 o1.connect(master);o2.connect(master);master.connect(c.destination);o1.start();o2.start();lfo.start();ambient={master,o1,o2,lfo};
}
function stopAmbient(){if(!ambient||!ctx)return;const a=ambient,t=ctx.currentTime;a.master.gain.cancelScheduledValues(t);a.master.gain.setValueAtTime(Math.max(.0001,a.master.gain.value),t);a.master.gain.linearRampToValueAtTime(.0001,t+.3);[a.o1,a.o2,a.lfo].forEach(o=>o.stop(t+.35));ambient=null}
function show(kind){lastFocus=document.activeElement;title.textContent=kind==='equipo'?'EQUIPO OSIRIS':kind==='reto'?'RETO F1025B':'LANZAMIENTOS POR VENIR...';desc.textContent=kind==='equipo'?'Próximamente conocerás más sobre los participantes de la misión.':kind==='reto'?'Los resultados del reto F1025B se publicarán próximamente.':'La misión está en preparación. Pronto habrá novedades.';backdrop.hidden=false;close.focus();if(soundOn)confirm()}
function hide(){backdrop.hidden=true;if(lastFocus)lastFocus.focus()}
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.panel)));
document.getElementById('missionDesktop').addEventListener('click',()=>show('mission'));document.getElementById('missionMobile').addEventListener('click',()=>show('mission'));
close.addEventListener('click',hide);backdrop.addEventListener('click',e=>{if(e.target===backdrop)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden)hide();if(e.key==='Tab'&&!backdrop.hidden){e.preventDefault();close.focus()}});
function toggle(){soundOn=!soundOn;['soundDesktop','soundMobile'].forEach(id=>{const b=document.getElementById(id);b.setAttribute('aria-pressed',String(soundOn));b.setAttribute('aria-label',soundOn?'Silenciar sonido':'Activar sonido')});if(soundOn){startAmbient();launch()}else stopAmbient()}
document.getElementById('soundDesktop').addEventListener('click',toggle);document.getElementById('soundMobile').addEventListener('click',toggle);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ctx&&ctx.state==='running')ctx.suspend();else if(!document.hidden&&soundOn&&ctx&&ctx.state==='suspended')ctx.resume()});
})();