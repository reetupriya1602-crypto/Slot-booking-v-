const slotsData=["9:00-10:00","10:00-11:00","11:00-12:00","3:00-4:00","4:00-5:00"];
const rewards={9:"⚡ Free Energy Drink",18:"🏸 Free Game Pass",27:"🎁 Sports T-Shirt"};
const maxPoints=27;
let selectedGame="", selectedDate="";

const loginBtn=document.getElementById('login-btn');
const logoutBtn=document.getElementById('logout-btn');
const gameButtons=document.querySelectorAll('.game-btn');
const dateNextBtn=document.getElementById('date-next');
const backBtn=document.getElementById('back-btn');

loginBtn.addEventListener('click',login);
logoutBtn.addEventListener('click',logout);
gameButtons.forEach(btn=>btn.addEventListener('click',()=>selectGame(btn.textContent)));
dateNextBtn.addEventListener('click',confirmDate);
backBtn.addEventListener('click',goBack);

// LOGIN
function login(){
  const email=document.getElementById('email-input').value.trim();
  const error=document.getElementById('login-error');
  if(!email){ error.textContent="Enter email"; return;}
  if(!email.endsWith("@gitam.in")&&!email.endsWith("@gitam.edu")){ error.textContent="Use GITAM email"; return;}
  localStorage.setItem("userEmail",email);
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('booking-section').classList.remove('hidden');
  document.getElementById('welcome-user').textContent=`Logged in as: ${email}`;
  showMyBookings();
}

// AUTO LOGIN
window.onload=()=>{
  const email=localStorage.getItem("userEmail");
  if(email){
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('booking-section').classList.remove('hidden');
    document.getElementById('welcome-user').textContent=`Logged in as: ${email}`;
    showMyBookings();
  }
};

function logout(){
  localStorage.removeItem("userEmail");
  document.getElementById('booking-section').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('email-input').value="";
}

function selectGame(game){
  selectedGame=game;
  document.getElementById('game-list').classList.add('hidden');
  document.getElementById('date-section').classList.remove('hidden');
}

function confirmDate(){
  selectedDate=document.getElementById('booking-date').value;
  if(!selectedDate){ alert("Select date"); return;}
  document.getElementById('date-section').classList.add('hidden');
  showSlots();
}

function showSlots(){
  const container=document.getElementById('slots'); container.innerHTML="";
  document.getElementById('slot-section').classList.remove('hidden');
  document.getElementById('game-title').textContent=`Available Slots for ${selectedGame} on ${selectedDate}`;
  const user=localStorage.getItem('userEmail'); 
  const bookings=JSON.parse(localStorage.getItem('bookings')||"[]");
  slotsData.forEach(slot=>{
    const btn=document.createElement('button'); btn.textContent=slot; btn.classList.add('slot-btn');
    if(bookings.find(b=>b.slot===slot&&b.game===selectedGame&&b.date===selectedDate)){btn.classList.add('booked'); btn.disabled=true;}
    btn.onclick=()=>bookSlot(user,selectedGame,slot,selectedDate);
    container.appendChild(btn);
  });
}

function goBack(){
  document.getElementById('slot-section').classList.add('hidden');
  document.getElementById('game-list').classList.remove('hidden');
}

function bookSlot(user,game,slot,date){
  let bookings=JSON.parse(localStorage.getItem('bookings')||"[]");
  bookings.push({user,game,slot,date});
  localStorage.setItem('bookings',JSON.stringify(bookings));
  let points=parseInt(localStorage.getItem(`${user}_points`)||"0");
  points+=3;
  localStorage.setItem(`${user}_points`,points);
  alert("✅ Thank you! Your slot is booked successfully.");
  showSlots();
  showMyBookings();
}

function showMyBookings(){
  const bookings=JSON.parse(localStorage.getItem('bookings')||"[]");
  const user=localStorage.getItem("userEmail");
  const list=document.getElementById('bookings-list'); list.innerHTML="";
  const userBookings=bookings.filter(b=>b.user===user);
  let points=parseInt(localStorage.getItem(`${user}_points`)||"0");
  document.getElementById('points-display').textContent=`⭐ Points: ${points}`;
  if(userBookings.length===0){ list.innerHTML="<li>No bookings yet</li>"; } 
  else{ userBookings.forEach(b=>{const li=document.createElement('li'); li.textContent=`${b.game} - ${b.slot} on ${b.date}`; list.appendChild(li);}); }
  checkRewards(user,points);
}

function checkRewards(user,points){
  const rewardDisplay=document.getElementById('reward-display'); 
  const progressMessage=document.getElementById('progress-message'); 
  rewardDisplay.textContent=""; progressMessage.textContent="";
  if(rewards[points]){ 
    rewardDisplay.textContent=`🎉 You unlocked: ${rewards[points]}`; 
    triggerConfetti();
  } else{ 
    const milestones=Object.keys(rewards).map(Number).filter(m=>m>points); 
    if(milestones.length>0){ const next=milestones[0]; progressMessage.textContent=`💪 Only ${next-points} more points to unlock next reward!`; } 
    else{ progressMessage.textContent="🏆 All rewards unlocked!";} 
  }
  document.getElementById('points-bar').style.width=Math.min((points/maxPoints)*100,100)+"%";
}

// SIMPLE CONFETTI
function triggerConfetti(){
  const canvas=document.getElementById('confetti-canvas');
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const ctx=canvas.getContext('2d');
  const particles=[];
  for(let i=0;i<100;i++){ 
    particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*6+4, dx:(Math.random()-0.5)*6, dy:(Math.random()-0.5)*6, color:`hsl(${Math.random()*360},100%,50%)`});
  }
  let frame=0;
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{ 
      p.x+=p.dx; p.y+=p.dy; 
      ctx.fillStyle=p.color; 
      ctx.beginPath(); 
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); 
      ctx.fill(); 
    });
    frame++; 
    if(frame<50) requestAnimationFrame(animate); 
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  animate();
}
