'use strict';
(() => {
 const machine=document.getElementById('machine'), lever=document.getElementById('lever'),reels=[...document.querySelectorAll('.reel')],dialog=document.getElementById('reward'),announcement=document.getElementById('announcement');
 const symbols = ['cherries', 'bell', 'bar', 'seven'];
 let state='idle',soundOn=false,audio=null,dragStart=0,dragAmount=0,dragging=false,lastResult=null,returnFrame=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const random=(n)=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return Math.floor(a[0]/4294967296*n)};
 function tile(symbol) {
   return `<div class="tile"><svg viewBox="0 0 120 120" aria-hidden="true"><use href="assets/slot-symbols.svg#${symbol}"/></svg></div>`;
 }

 function resetReels() {
   reels.forEach((reel, index) => {
     const track = reel.firstElementChild;
     track.classList.add('initial');
     track.innerHTML = ['seven', symbols[index], 'seven'].map(tile).join('');
     track.style.transform = 'translateY(-70%)';
   });
 }
 function drawLever(value){const y=432+value,x=730+value*.012;['shaft','shaft-shadow'].forEach(id=>{const e=document.getElementById(id);e.setAttribute('x2',x);e.setAttribute('y2',y);});['ball','ball-shadow'].forEach(id=>{const e=document.getElementById(id);e.setAttribute('cx',x+(id==='ball-shadow'?2:0));e.setAttribute('cy',y+(id==='ball-shadow'?5:0));});const s=document.getElementById('shine');s.setAttribute('cx',x-13);s.setAttribute('cy',y-22);s.setAttribute('transform',`rotate(-28 ${x-13} ${y-22})`);}
 function releaseLever(){cancelAnimationFrame(returnFrame);const start=performance.now(),from=dragAmount;function tick(now){const p=Math.min(1,(now-start)/280);drawLever(from*Math.pow(1-p,3));if(p<1)returnFrame=requestAnimationFrame(tick);else{dragAmount=0;if(state==='idle'&&!dragging)machine.classList.add('idle');}}returnFrame=requestAnimationFrame(tick);}
 function tone(freq,duration=.08,type='sine',volume=.05){if(!soundOn)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
 function results(){return [random(4),random(4),random(4)].map(i=>symbols[i]);}
 function rewardFor(values){const unique=new Set(values).size;return unique===1?15:unique===2?10:5;}
 function animateReel(reel, index, target) {
   const track = reel.firstElementChild;
   track.classList.remove('initial');
   const items = Array.from({length: 48 + index * 4}, () => symbols[random(symbols.length)]);
   items.push(target, symbols[random(symbols.length)]);
   track.innerHTML = items.map(tile).join('');
   const end = `translateY(-${(items.length - 2) * 70}%)`;
   track.style.transform = end;
   if (reduced) return Promise.resolve();
   const animation = track.animate(
     [{transform: 'translateY(-70%)'}, {transform: end}],
     {duration: 4200 + index * 400, easing: 'cubic-bezier(.16,.52,.22,1)', fill: 'none'}
   );
   return animation.finished.then(() => tone(160 + index * 80, .1, 'triangle', .07));
 }
 function celebrate(){const box=document.getElementById('confetti');box.replaceChildren();if(reduced)return;for(let i=0;i<42;i++){const bit=document.createElement('i');bit.style.left=random(100)+'%';bit.style.background=['#ffedbc','#e14025','#d6aa53','#23865e'][random(4)];bit.style.animationDelay=(random(600)/1000)+'s';bit.style.setProperty('--drift',(random(250)-125)+'px');bit.style.transform=`rotate(${random(180)}deg)`;box.appendChild(bit);}setTimeout(()=>box.replaceChildren(),3500);}
 async function spin(){if(state!=='idle')return;state='spinning';lastResult=null;lever.disabled=true;machine.classList.remove('winner','idle');machine.classList.add('spinning');document.getElementById('spin-status').textContent='Something tasty is spinning…';announcement.textContent='The reels are spinning.';tone(110,.15,'triangle',.06);const values=results();const tick=setInterval(()=>tone(80+random(100),.025,'triangle',.025),80);try{await Promise.all(reels.map((r,i)=>animateReel(r,i,values[i])));}finally{clearInterval(tick)}
 const amount=rewardFor(values);lastResult={symbols:values,amount};state='celebrating';machine.classList.remove('spinning');machine.classList.add('winner');document.getElementById('spin-status').textContent=`You won ${amount}% off!`;announcement.textContent=`${values.join(', ')}. You won ${amount} percent off. Your coupon is opening.`;[523,659,784,1047].forEach((n,i)=>setTimeout(()=>tone(n,.24,'sine',.07),i*135));await new Promise(resolve=>setTimeout(resolve,reduced?100:1450));document.getElementById('reward-amount').textContent=amount;dialog.showModal();document.getElementById('again').focus();celebrate();state='reward';}
 function ready(){if(state==='spinning'||state==='celebrating')return;dialog.close();state='idle';lever.disabled=false;machine.classList.remove('winner');machine.classList.add('idle');document.getElementById('spin-status').textContent='';lever.focus({preventScroll:true});}
 lever.addEventListener('pointerdown',e=>{if(state!=='idle')return;cancelAnimationFrame(returnFrame);machine.classList.remove('idle');dragging=true;dragStart=e.clientY;dragAmount=0;lever.setPointerCapture(e.pointerId);});
 lever.addEventListener('pointermove',e=>{if(!dragging)return;const scale=machine.getBoundingClientRect().height/1202;dragAmount=Math.max(0,Math.min(405,(e.clientY-dragStart)/scale));drawLever(dragAmount);});
 lever.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const shouldSpin=dragAmount>65||Math.abs(e.clientY-dragStart)<7;releaseLever();if(shouldSpin)spin();});
 lever.addEventListener('pointercancel',()=>{dragging=false;releaseLever();});
 lever.addEventListener('click',e=>{if(e.detail===0)spin();});
 document.getElementById('again').addEventListener('click',ready);document.getElementById('close').addEventListener('click',ready);dialog.addEventListener('cancel',e=>{e.preventDefault();ready();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)ready();}});
 document.getElementById('sound').addEventListener('click',e=>{soundOn=!soundOn;const b=e.currentTarget;b.setAttribute('aria-pressed',String(soundOn));b.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');if(soundOn)tone(523,.1,'sine',.04);});
 const bulbPositions=[[176,366],[247,358],[317,353],[389,353],[460,356],[530,364]];document.getElementById('bulbs').innerHTML=bulbPositions.map(([x,y],i)=>`<g class="bulb" style="--bulb-delay:${i*.22}s"><circle class="bulb-shade" cx="${x}" cy="${y}" r="13" fill="#432303"/><circle class="bulb-glow" cx="${x}" cy="${y}" r="30" filter="url(#glow)"/><circle class="bulb-core" cx="${x}" cy="${y}" r="12" fill="url(#warm-filament)"/></g>`).join('');
 document.addEventListener('visibilitychange',()=>machine.classList.toggle('motion-paused',document.hidden));
 resetReels();
})();
