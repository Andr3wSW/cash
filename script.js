// =====================================
// CASH CLICKER
// =====================================

// =====================================
// FIREBASE
//======================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3UvML31jHXjZzk3ahE1AjasKK6vFFwoY",
  authDomain: "cash-68677.firebaseapp.com",
  projectId: "cash-68677",
  storageBucket: "cash-68677.firebasestorage.app",
  messagingSenderId: "782765971454",
  appId: "1:782765971454:web:a4a536229c904806fcd2af",
  measurementId: "G-GZ7W952Q1C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;

// =====================================
// DATA
// =====================================

let money = 0;
let clickPower = 1;
let upgradeCost = 10;
let prestigeLevel = 0;
let username = "Player";
let stockQuantity = 1;
let selectedStock = 0;
let achievements = {

    money100:false,
    money1000:false,
    money10000:false,
    money100000:false,

    copper5:false,
    silver5:false,
    gold5:false,
    diamond5:false,
    crypto5:false,

    prestige1:false,
    prestige5:false,
    prestige10:false

};
let stocks = [

{
    ticker:"CSH",
    name:"Cash Corp",

    price:100,
    previousPrice:100,

    owned:0,
    averageCost:0,

    volatility:.015,
    trend:.001,

    history:Array(40).fill(100),

    description:
        "A large banking company with slow but steady growth.",

    risk:"Low"

},

{
    ticker:"GLD",
    name:"Gold Industries",

    price:250,
    previousPrice:250,

    owned:0,
    averageCost:0,

    volatility:.02,
    trend:.0015,

    history:Array(40).fill(250),

    description:
        "A mining company specializing in precious metals.",

    risk:"Low"

},

{
    ticker:"TEC",
    name:"TechNova",

    price:500,
    previousPrice:500,

    owned:0,
    averageCost:0,

    volatility:.04,
    trend:.002,

    history:Array(40).fill(500),

    description:
        "A rapidly growing AI technology company.",

    risk:"Medium"

},

{
    ticker:"CRY",
    name:"CryptoChain",

    price:800,
    previousPrice:800,

    owned:0,
    averageCost:0,

    volatility:.08,
    trend:.003,

    history:Array(40).fill(800),

    description:
        "A volatile cryptocurrency company with huge swings.",

    risk:"Extreme"

}

];

let upgrades = {

    coinCollector:false,
    moneyMagnet:false,
    atmNetwork:false,
    printingPress:false,
    federalReserve:false,

    luckyPenny:false,
    loadedDice:false,
    cardCounter:false,
    houseInsider:false,
    riggedReality:false

};

const shopUpgrades = [

{
    id:"coinCollector",
    name:"Coin Collector",
    description:"+1 money/sec",
    cost:500
},

{
    id:"moneyMagnet",
    name:"Money Magnet",
    description:"+5 money/sec",
    cost:2500
},

{
    id:"atmNetwork",
    name:"ATM Network",
    description:"+25 money/sec",
    cost:15000
},

{
    id:"printingPress",
    name:"Printing Press",
    description:"+100 money/sec",
    cost:100000
},

{
    id:"federalReserve",
    name:"Federal Reserve",
    description:"+500 money/sec",
    cost:1000000
},

{
    id:"luckyPenny",
    name:"Lucky Penny",
    description:"+5% casino winnings",
    cost:2500
},

{
    id:"loadedDice",
    name:"Loaded Dice",
    description:"+10% casino winnings",
    cost:10000
},

{
    id:"cardCounter",
    name:"Card Counter",
    description:"+25% blackjack winnings",
    cost:50000
},

{
    id:"houseInsider",
    name:"House Insider",
    description:"+50% casino winnings",
    cost:250000
},

{
    id:"riggedReality",
    name:"Rigged Reality",
    description:"+100% casino winnings",
    cost:5000000
}

];

let blackjackBet = 0;
let playerHand = [];
let dealerHand = [];
let blackjackActive = false;

// =====================================
// UI REFERENCES
// =====================================

const moneyDisplay =
document.getElementById("money");

const sidebarMoney =
document.getElementById("sidebarMoney");

const coin =
document.getElementById("coin");

const coinTier =
document.getElementById("coinTier");

const upgradeBtn =
document.getElementById("upgradeBtn");

// =====================================
// COIN STAGES
// =====================================

const coinStages = [

{
    name:"Copper",
    symbol:"¢",
    color1:"#c97b3b",
    color2:"#a65b1d"
},

{
    name:"Silver",
    symbol:"S",
    color1:"#dddddd",
    color2:"#999999"
},

{
    name:"Gold",
    symbol:"$",
    color1:"#ffd54f",
    color2:"#ffb300"
},

{
    name:"Diamond",
    symbol:"♦",
    color1:"#80deea",
    color2:"#26c6da"
},

{
    name:"Crypto",
    symbol:"₿",
    color1:"#d9fe54",
    color2:"#80f123"
}

];

// =====================================
// UI UPDATE
// =====================================

function updateCoinVisual(){

    const stage =
    Math.min(
        Math.floor((clickPower-1)/5),
        4
    );

    const tier =
    ((clickPower-1)%5)+1;

    const data =
    coinStages[stage];

    const multiplier =
    2 ** prestigeLevel;

    coin.textContent =
    data.symbol;

    coin.style.background =
    `linear-gradient(
        135deg,
        ${data.color1},
        ${data.color2}
    )`;

    coinTier.textContent =
    `${data.name} Tier ${tier}
    x${multiplier}`
}

function updateUI(){

    const displayMoney =
    "$" +
    Math.floor(money);

    moneyDisplay.textContent =
    displayMoney;

    sidebarMoney.textContent =
    displayMoney;

    upgradeBtn.textContent =
    `Upgrade Coin ($${upgradeCost})`;

    if(clickPower >= 25){
        upgradeBtn.textContent =
            "⭐ PRESTIGE";

        }else{

    upgradeBtn.textContent =
    `Upgrade Coin ($${upgradeCost})`;

}

    const passiveIncomeDisplay =
    document.getElementById(
    "passiveIncome"
    );

    if(passiveIncomeDisplay){

        passiveIncomeDisplay.textContent =
        "$" +
        getPassiveIncome() +
        "/sec";
}
    updateCoinVisual();
    checkAchievements();
    updateAchievementList();
}

// =====================================
// FLOATING MONEY
// =====================================

function createFloatingMoney(amount){

    const popup =
    document.createElement("div");

    popup.className =
    "floatingMoney";

    popup.textContent =
    "+" + amount;

    const rect =
    coin.getBoundingClientRect();

    popup.style.left =
    (
        rect.left +
        Math.random()*rect.width
    ) + "px";

    popup.style.top =
    (
        rect.top +
        Math.random()*rect.height
    ) + "px";

    document.body
    .appendChild(popup);

    setTimeout(()=>{

        popup.remove();

    },1000);
}

// =====================================
// CLICKING
// =====================================

coin.addEventListener("click",()=>{

    const clickValue =
    clickPower *
    (2 ** prestigeLevel);

    money += clickValue;

    createFloatingMoney(
        clickValue
    );

    updateUI();

});

upgradeBtn.addEventListener(
    "click",
    ()=>{

        if(
            money < upgradeCost
        ) return;

        money -= upgradeCost;

        if(clickPower >= 25){

            prestige();

            return;
        }

        clickPower++;

        upgradeCost =
        Math.floor(
            upgradeCost * 1.5
        );

        coin.style.animation =
        "spin .6s";

        setTimeout(()=>{

            coin.style.animation =
            "";

        },600);

        updateUI();

    }
);

// =====================================
// SAVE SYSTEM
// =====================================

async function saveToCloud(){

     console.log("Saving...");
    console.log({
        username: document.getElementById("username").value,
        money,
        clickPower,
        upgradeCost,
        prestigeLevel,
        achievements,
        upgrades
    });

    if(!uid) return;

    await setDoc(doc(db, "players", uid), {

        money,
        username: document.getElementById("username").value,
        clickPower,
        upgradeCost,
        prestigeLevel,
        achievements,
        upgrades
    });

}

async function loadCloudSave(){

    const ref = doc(db, "players", uid);
    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const data = snap.data();

    money = data.money ?? 0;
    clickPower = data.clickPower ?? 1;
    upgradeCost = data.upgradeCost ?? 10;
    prestigeLevel = data.prestigeLevel ?? 0;
    upgrades = data.upgrades ?? upgrades;
    
    updateAccountPage(data);

    document.getElementById("userDisplay").textContent =
        data.username || "Player";

        if(data.achievements){
            achievements =
            data.achievements;
        }

        if(data.portfolio){

            stocks.forEach(stock=>{

                if(data.portfolio[stock.ticker]){

                    stock.owned=

                    data.portfolio[stock.ticker].owned;

                    stock.averageCost=

                    data.portfolio[stock.ticker].averageCost;

                }

        });

}

}
    loadShop();
    loadStocks();
    await loadMarket();
    updateUI();


function logout(){
    signOut(auth);
    location.reload();
}
// =====================================
// MONEY RAIN
// =====================================

function spawnDollar(){

    const dollar =
    document.createElement(
        "div"
    );

    dollar.className =
    "dollar";

    dollar.textContent =
    "$";

    dollar.style.left =
    Math.random()*100 +
    "vw";

    dollar.style.fontSize =
    (
        20 +
        Math.random()*40
    ) + "px";

    dollar.style.animationDuration =
    (
        5 +
        Math.random()*8
    ) + "s";

    document
    .getElementById(
        "moneyRain"
    )
    .appendChild(
        dollar
    );

    setTimeout(()=>{

        dollar.remove();

    },13000);
}

setInterval(
    spawnDollar,
    400
);

setInterval(saveToCloud,5000);

// =====================================
// TABS
// =====================================

document
.querySelectorAll(".tabBtn")
.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".tab")
            .forEach(tab=>{

                tab.classList.remove(
                    "active"
                );

            });

            document
            .getElementById(
                button.dataset.tab
            )
            .classList.add(
                "active"
            );

            if(button.dataset.tab === "leaderboards"){

                loadLeaderboard();

            }

        }
    );

});

// =====================================
// CASINO NAVIGATION
// =====================================

const casinoMenu =
document.getElementById(
    "casinoMenu"
);

const casinoGameView =
document.getElementById(
    "casinoGameView"
);

const gameContent =
document.getElementById(
    "gameContent"
);

document
.querySelectorAll(
    ".casinoCard"
)
.forEach(card=>{

    card.addEventListener(
        "click",
        ()=>{

            openGame(
                card.dataset.game
            );

        }
    );

});

document
.getElementById(
    "backCasino"
)
.addEventListener(
    "click",
    ()=>{

        casinoGameView.style.display =
        "none";

        casinoMenu.style.display =
        "block";

    }
);

function getCasinoMultiplier(){

    let mult = 1;

    if(upgrades.luckyPenny)
        mult += .05;

    if(upgrades.loadedDice)
        mult += .10;

    if(upgrades.houseInsider)
        mult += .50;

    if(upgrades.riggedReality)
        mult += 1;

    return mult;
}

function getBlackjackMultiplier(){

    let mult =
    getCasinoMultiplier();

    if(upgrades.cardCounter)
        mult += .25;

    return mult;
}

// =====================================
// GAME LOADER
// =====================================

function openGame(game){

    casinoMenu.style.display =
    "none";

    casinoGameView.style.display =
    "block";

    if(game==="coinflip")
        loadCoinFlip();

    if(game==="dice")
        loadDice();

    if(game==="slots")
        loadSlots();

    if(game==="blackjack")
        loadBlackjack();

}

// =====================================
// RESULT HELPER
// =====================================

function resultEl(text){

    const result =
    document.getElementById(
        "result"
    );

    if(result){

        result.textContent =
        text;

    }

}

// =====================================
// COIN FLIP
// =====================================

function loadCoinFlip(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Coin Flip</h1>

        <input id="bet" class="betInput" type="number" value="10">

        <div id="flipCoin" class="flipCoin"></div>

        <button class="playBtn" id="headsBtn">Heads</button>
        <button class="playBtn" id="tailsBtn">Tails</button>

        <p id="result"></p>

    </div>

    `;

    const coin = document.getElementById("flipCoin");
    const result = document.getElementById("result");

    function setHeads(){
        coin.className = "headsCoin";
        coin.innerHTML = " ";
    }

    function setTails(){
        coin.className = "tailsCoin";
        coin.innerHTML = " ";
    }

    setHeads();

    document.getElementById("headsBtn").onclick =
    () => playCoinFlip("heads", coin, result, setHeads, setTails);

    document.getElementById("tailsBtn").onclick =
    () => playCoinFlip("tails", coin, result, setHeads, setTails);
}

function playCoinFlip(choice, coin, resultEl, setHeads, setTails){

    const betInput = document.getElementById("bet");
    const betAmount = Number(betInput.value);

    // BET VALIDATION
    if(betAmount <= 0 || betAmount > money){
        showBetError("Can't bet more than you have");
        return;
    }

    // lock buttons during animation
    document.getElementById("headsBtn").disabled = true;
    document.getElementById("tailsBtn").disabled = true;

    // flip animation
    coin.classList.add("flipAnimation");

    setTimeout(() => {

        coin.classList.remove("flipAnimation");

        const result = Math.random() < 0.5 ? "heads" : "tails";

        // update visual coin
        if(result === "heads") setHeads();
        else setTails();

        money -= betAmount;

        if(choice === result){

            money += betAmount * 2 * getCasinoMultiplier();

            resultEl.textContent = `WIN! (${result})`;

            winAnimation();

        } else {

            resultEl.textContent = `LOSS! (${result})`;
        }

        updateUI();

        // unlock buttons
        document.getElementById("headsBtn").disabled = false;
        document.getElementById("tailsBtn").disabled = false;

    }, 900);
}

// =====================================
// DICE
// =====================================

function loadDice(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Dice Roll</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div
        id="dice"
        class="diceBox">

            🎲

        </div>

        <button
        class="playBtn"
        id="rollBtn">

            Roll

        </button>

        <p id="result"></p>

    </div>
    `;

    document
    .getElementById(
        "rollBtn"
    )
    .onclick =
    playDice;

}

function playDice(){

    const bet =
    Number(
        document
        .getElementById(
            "bet"
        ).value
    );

    if(bet <= 0 || bet > money){
        showBetError("Can't bet more than you have");
        return;
    }

    const dice =
    document
    .getElementById(
        "dice"
    );

    dice.classList.add(
        "rollAnimation"
    );

    let spins = 0;

    const rollInterval =
    setInterval(()=>{

        dice.textContent =
        Math.floor(
            Math.random()*6
        ) + 1;

        spins++;

        if(spins > 12){

            clearInterval(
                rollInterval
            );

            finishDice(
                bet,
                dice
            );

        }

    },70);

}

function finishDice(
    bet,
    dice
){

    dice.classList.remove(
        "rollAnimation"
    );

    const roll =
    Math.floor(
        Math.random()*6
    ) + 1;

    dice.textContent =
    roll;

    money -= bet;

    if(roll >= 5){

        money += bet * 2 * getCasinoMultiplier();

        resultEl(
            `WIN (${roll})`
        );

        winAnimation();

    }
    else{

        resultEl(
            `LOSS (${roll})`
        );

    }

    updateUI();

}

// =====================================
// SLOTS
// =====================================

function loadSlots(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Slots</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div class="slotMachine">

            <div class="slot" id="s1">❔</div>
            <div class="slot" id="s2">❔</div>
            <div class="slot" id="s3">❔</div>

        </div>

        <button class="playBtn" id="spinBtn">
            Spin
        </button>

        <p id="result"></p>

    </div>

    `;

    document
    .getElementById("spinBtn")
    .onclick =
    playSlots;

}

function playSlots(){

    const bet =
    Number(
        document
        .getElementById("bet")
        .value
    );

    if(bet <= 0 || bet > money){
        showBetError("Can't bet more than you have");
        return;
    }

    const symbols =
    ["🍒","🍋","⭐","💎","7️⃣"];

    const s1 =
    document.getElementById("s1");

    const s2 =
    document.getElementById("s2");

    const s3 =
    document.getElementById("s3");

    let spins = 0;

    const interval =
    setInterval(()=>{

        s1.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        s2.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        s3.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        spins++;

        if(spins > 18){

            clearInterval(interval);

            finishSlots(bet);

        }

    },80);

}

function finishSlots(bet){

    const symbols =
    ["🍒","🍋","⭐","💎","7️⃣"];

    const a =
    symbols[Math.floor(Math.random()*symbols.length)];

    const b =
    symbols[Math.floor(Math.random()*symbols.length)];

    const c =
    symbols[Math.floor(Math.random()*symbols.length)];

    document.getElementById("s1").textContent = a;
    document.getElementById("s2").textContent = b;
    document.getElementById("s3").textContent = c;

    money -= bet;

    let payout = 0;

    if(a === b && b === c)
        payout = 10;

    else if(a === b || b === c || a === c)
        payout = 2;

    money += bet * getCasinoMultiplier() * payout;

    resultEl(
        payout > 0
        ? `WIN x${payout}`
        : "LOSS"
    );

    updateUI();

}

// =====================================
// BLACKJACK (FULL GAME)
// =====================================

let deck = [];
let standMode = false;

// create deck
function createDeck(){

    const suits = ["♠","♥","♦","♣"];
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

    deck = [];

    for(let s of suits){
        for(let v of values){
            deck.push(v + s);
        }
    }

    deck.sort(()=>Math.random() - 0.5);

}

function cardValue(card){

    const value = card.slice(0,-1);

    if(value === "A") return 11;
    if(["J","Q","K"].includes(value)) return 10;

    return Number(value);

}

function handTotal(hand){

    let total = 0;
    let aces = 0;

    for(let c of hand){

        const v = c.slice(0,-1);

        if(v === "A"){
            aces++;
            total += 11;
        }
        else if(["J","Q","K"].includes(v)){
            total += 10;
        }
        else{
            total += Number(v);
        }

    }

    while(total > 21 && aces > 0){
        total -= 10;
        aces--;
    }

    return total;

}

function loadBlackjack(){

    gameContent.innerHTML = `

    <div class="gamePanel blackjackBoard">

        <h1>Blackjack</h1>

        <input id="bet" class="betInput" type="number" value="10">

        <div>
            <div class="handTitle">Dealer</div>
            <div id="dealerCards" class="cardArea"></div>
        </div>

        <div>
            <div class="handTitle">You</div>
            <div id="playerCards" class="cardArea"></div>
        </div>

        <div>

            <button class="playBtn" id="dealBtn">Deal</button>
            <button class="playBtn" id="hitBtn">Hit</button>
            <button class="playBtn" id="standBtn">Stand</button>

        </div>

        <p id="result"></p>

    </div>

    `;

    document.getElementById("dealBtn").onclick = startBlackjack;
    document.getElementById("hitBtn").onclick = hit;
    document.getElementById("standBtn").onclick = stand;

}

function startBlackjack(){

    const bet =
    Number(document.getElementById("bet").value);

    if(bet <= 0 || bet > money){
        showBetError("Can't bet more than you have");
        return;
    }

    blackjackBet = bet;

    money -= bet;

    createDeck();

    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    standMode = false;

    renderBlackjack(true);

}

function renderBlackjack(hideDealerCard = true){

    const dealerDiv =
    document.getElementById("dealerCards");

    const playerDiv =
    document.getElementById("playerCards");

    dealerDiv.innerHTML = "";
    playerDiv.innerHTML = "";

    dealerHand.forEach((card, i)=>{

        const div = document.createElement("div");
        div.className = "card";

        if(i === 1 && hideDealerCard && !standMode){
            div.textContent = "❓";
            div.classList.add("hiddenCard");
        } else {
            div.textContent = card;
        }

        dealerDiv.appendChild(div);

    });

    playerHand.forEach(card=>{

        const div = document.createElement("div");
        div.className = "card";
        div.textContent = card;

        playerDiv.appendChild(div);

    });

    checkGame();

}

function hit(){

    if(!playerHand.length) return;

    playerHand.push(deck.pop());

    renderBlackjack(true);

}

function stand(){

    standMode = true;

    while(handTotal(dealerHand) < 17){
        dealerHand.push(deck.pop());
    }

    renderBlackjack(false);

    resolveBlackjack();

}

function checkGame(){

    const player = handTotal(playerHand);

    if(player > 21){
        resultEl("BUST - You Lose");
        updateUI();
    }

}

function resolveBlackjack(){

    const player = handTotal(playerHand);
    const dealer = handTotal(dealerHand);

    if(player > 21){

        resultEl("BUST - Dealer Wins");

    }
    else if(dealer > 21 || player > dealer){

        money += blackjackBet * 2 * getBlackjackMultiplier();
        resultEl(`YOU WIN (${player} vs ${dealer})`);

        winAnimation();

    }
    else if(player === dealer){

        money += blackjackBet;
        resultEl("PUSH");

    }
    else{

        resultEl(`YOU LOSE (${player} vs ${dealer})`);

    }

    updateUI();

}

// =====================================
// START GAME
// =====================================

updateUI();
loadShop();

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");


const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const authBox = document.getElementById("authBox");
const status = document.getElementById("authStatus");

registerBtn.onclick = async () => {

    try {

        const userCred = await createUserWithEmailAndPassword(
            auth,
            emailInput.value,
            passInput.value
        );

        const uid = userCred.user.uid;

        await setDoc(doc(db, "players", uid), {

            username: usernameInput.value,
            money: 0,
            clickPower: 1,
            upgradeCost: 10

        });

        status.textContent = "Account created!";

    } catch (e) {
        status.textContent = e.message;
    }

};

loginBtn.onclick = async () => {

    try {

        await signInWithEmailAndPassword(
            auth,
            emailInput.value,
            passInput.value
        );

        status.textContent = "Logged in!";

    } catch (e) {

        status.textContent = e.message;

    }

};

onAuthStateChanged(auth, async (user) => {

    console.log("AUTH STATE:", user);

    if(!user) return;

    uid = user.uid;
    
    console.log("UID:", uid);

    authBox.style.display = "none";

    await loadCloudSave();

});

function winAnimation(){

    const panel =
    document.querySelector(".gamePanel");

    if(!panel) return;

    panel.classList.add("winFlash");

    setTimeout(()=>{
        panel.classList.remove("winFlash");
    },600);

}

function showBetError(msg){

    let el = document.getElementById("betMessage");

    if(!el){
        el = document.createElement("div");
        el.id = "betMessage";
        document.querySelector(".gamePanel").appendChild(el);
    }

    el.textContent = msg;

    setTimeout(()=>{
        el.textContent = "";
    },2000);

}

// =====================================
// LEADERBOARD
// =====================================

async function loadLeaderboard(){

    const leaderboard =
    document.getElementById(
        "leaderboardList"
    );

    leaderboard.innerHTML =
    "Loading...";

    const q = query(
        collection(db,"players"),
        orderBy("money","desc"),
        limit(50)
    );

    const snapshot =
    await getDocs(q);

    let html = "";

    let rank = 1;

    snapshot.forEach(doc=>{

        const data =
        doc.data();

        html += `

        <div class="leaderboardEntry">

            <span>
                #${rank}
            </span>

            <span>
                ${data.username || "Unknown"}
            </span>

            <span>
                $${Math.floor(data.money || 0)}
            </span>

        </div>

        `;

        rank++;

    });

    leaderboard.innerHTML = html;
}

document
.getElementById("signOutBtn")
.onclick = async ()=>{

    await signOut(auth);

    location.reload();

};

function checkAchievements(){

    if(money >= 100)
        unlockAchievement(
            "money100",
            "First Hundred"
        );

    if(money >= 1000)
        unlockAchievement(
            "money1000",
            "Thousandaire"
        );

    if(money >= 10000)
        unlockAchievement(
            "money10000",
            "Big Money"
        );

    if(money >= 100000)
        unlockAchievement(
            "money100000",
            "Cash King"
        );

    if(clickPower >= 5)
        unlockAchievement(
            "copper5",
            "Copper Master"
        );

    if(clickPower >= 10)
        unlockAchievement(
            "silver5",
            "Silver Master"
        );

    if(clickPower >= 15)
        unlockAchievement(
            "gold5",
            "Gold Master"
        );

    if(clickPower >= 20)
        unlockAchievement(
            "diamond5",
            "Diamond Master"
        );

    if(clickPower >= 25)
        unlockAchievement(
            "crypto5",
            "Crypto Master"
        );

    if(prestigeLevel >= 1)
        unlockAchievement(
            "prestige1",
            "First Prestige"
        );

    if(prestigeLevel >= 5)
        unlockAchievement(
            "prestige5",
            "Prestige V"
        );

    if(prestigeLevel >= 10)
        unlockAchievement(
            "prestige10",
            "Prestige X"
        );
}

function updateAccountPage(data){

    document.getElementById(
        "accountUsername"
    ).textContent =
    data.username;

    document.getElementById(
        "accountEmail"
    ).textContent =
    auth.currentUser.email;

    document.getElementById(
        "prestigeDisplay"
    )
    .textContent =
    `Prestige ${prestigeLevel}`
}

function prestige(){

    prestigeLevel++;

    clickPower = 1;

    upgradeCost = 10;

    saveToCloud();

    updateUI();

    showAchievementPopup(
        `⭐ Prestige ${prestigeLevel}`
    );

}

function showAchievementPopup(text){

    const popup =
    document.createElement("div");

    popup.className =
    "achievementPopup";

    popup.textContent =
    "🏆 " + text;

    document.body.appendChild(
        popup
    );

    setTimeout(()=>{

        popup.remove();

    },3000);

}

function unlockAchievement(
    key,
    title
){

    if(
        achievements[key]
    )
        return;

    achievements[key] =
    true;

    showAchievementPopup(
        title
    );

    saveToCloud();
}

function updateAchievementList(){

    const list =
    document.getElementById(
        "achievementList"
    );

    if(!list)
        return;

    list.innerHTML = "";

    const names = {

        money100:"First Hundred",
        money1000:"Thousandaire",
        money10000:"Big Money",
        money100000:"Cash King",

        copper5:"Copper Master",
        silver5:"Silver Master",
        gold5:"Gold Master",
        diamond5:"Diamond Master",
        crypto5:"Crypto Master",

        prestige1:"First Prestige",
        prestige5:"Prestige V",
        prestige10:"Prestige X"

    };

    for(
        const key in names
    ){

        const div =
        document.createElement(
            "div"
        );

        div.className =
        achievements[key]
        ? "achievement unlocked"
        : "achievement locked";

        div.textContent =
        names[key];

        list.appendChild(div);
    }
}

const chatQuery = query(

    collection(db,"chat"),

    orderBy(
        "timestamp",
        "asc"
    ),

    limit(100)

);

onSnapshot(

    chatQuery,

    (snapshot)=>{

        const chatBox =
        document.getElementById(
            "chatMessages"
        );

        if(!chatBox)
            return;

        chatBox.innerHTML = "";

        snapshot.forEach(doc=>{

            const data =
            doc.data();

            chatBox.innerHTML +=

            `<div class="chatMessage">

                <span class="chatUsername">

                ${data.username}

                </span>

                : ${data.message}

            </div>`;

        });

        chatBox.scrollTop =
        chatBox.scrollHeight;

    }

);

async function sendChatMessage(){

    const input =
    document.getElementById(
        "chatInput"
    );

    if(!input)
        return;

    const message =
    input.value.trim();

    if(message === "")
        return;

    console.log(username);

    await addDoc(

        collection(
            db,
            "chat"
        ),

        {

            username:

            document
            .getElementById(
                "usernameDisplay"
            )
            .textContent,

            message:

            message,

            timestamp:
            serverTimestamp()

        }

    );

    input.value = "";
}

document.addEventListener(

    "click",

    (e)=>{

        if(
            e.target &&
            e.target.id ===
            "sendChatBtn"
        ){

            sendChatMessage();

        }

    }

);

document.addEventListener(

    "keydown",

    (e)=>{

        if(

            e.key === "Enter"

            &&

            document.activeElement
            .id === "chatInput"

        ){

            sendChatMessage();

        }

    }

);
// =====================================
// UPGRADE SHOP
// =====================================

setInterval(()=>{

    money += getPassiveIncome();

    updateUI();

},1000);

function loadShop(){

    const container =
    document.getElementById(
        "shopContainer"
    );

    if(!container) return;

    container.innerHTML = "";

    shopUpgrades.forEach(upgrade=>{

        const owned =
        upgrades[upgrade.id];

        container.innerHTML += `

        <div class="shopCard">

            <h2>
            ${upgrade.name}
            </h2>

            <p>
            ${upgrade.description}
            </p>

            <p class="shopCost">
            $${upgrade.cost.toLocaleString()}
            </p>

            <p>
            Owned:
            ${owned ? "✅" : "❌"}
            </p>

            <button
            class="buyBtn"
            onclick="buyUpgrade('${upgrade.id}')"
            ${owned ? "disabled" : ""}
            >

            Buy

            </button>

        </div>

        `;

    });

}

function buyUpgrade(id){

    const upgrade =
    shopUpgrades.find(
        u=>u.id===id
    );

    if(!upgrade) return;

    if(upgrades[id])
        return;

    if(money < upgrade.cost){

        showAchievementPopup(
            "Not enough money!"
        );

        return;
    }

    money -= upgrade.cost;

    upgrades[id] = true;

    saveToCloud();

    loadShop();

    updateUI();

}
window.buyUpgrade =
buyUpgrade;

function getPassiveIncome(){

    let income = 0;

    if(upgrades.coinCollector)
        income += 1;

    if(upgrades.moneyMagnet)
        income += 5;

    if(upgrades.atmNetwork)
        income += 25;

    if(upgrades.printingPress)
        income += 100;

    if(upgrades.federalReserve)
        income += 500;

    return income;
}

function ownsUpgrade(value){

    return value
    ? "✅"
    : "❌";

}

// =====================================
// STOCK MARKET
// =====================================

function loadStocks(){

    const container =
    document.getElementById("stockContainer");

    container.innerHTML="";

    stocks.forEach((stock,index)=>{

        const percent =
        ((stock.price-stock.previousPrice)
        /stock.previousPrice)*100;

        let direction="➖";
        let color="stockNeutral";

        if(percent>0){

            direction="▲";
            color="stockUp";

        }

        else if(percent<0){

            direction="▼";
            color="stockDown";

        }

        let riskColor="🟢";

        switch(stock.risk){

            case "Medium":
                riskColor="🔵";
                break;

            case "High":
                riskColor="🟠";
                break;

            case "Extreme":
                riskColor="🔴";
                break;

        }

        container.innerHTML+=`

<div class="stockCard ${color}"
onclick="openStock(${index})">

<h2>${stock.name}</h2>

<p>${stock.ticker}</p>

<p>${riskColor} ${stock.risk} Risk</p>

<h3>$${stock.price.toFixed(2)}</h3>

<p>

${direction}
${Math.abs(percent).toFixed(2)}%

</p>

<p>

Owned:
<strong>${stock.owned}</strong>

</p>

<button>

Open →

</button>

</div>

`;

    });

}

function openStock(index){

    selectedStock=index;

    const stock=stocks[index];

    stockQuantity=Math.max(1,stockQuantity);

    document.getElementById("stockPage").classList.remove("hidden");

    document.getElementById("stockName").textContent=stock.name;

    document.getElementById("stockTicker").textContent=stock.ticker;

    document.getElementById("stockPrice").textContent="$"+stock.price.toFixed(2);

    const percent=((stock.price-stock.previousPrice)/stock.previousPrice*100);

    document.getElementById("stockChange").textContent=
    (percent>=0?"▲ ":"▼ ")+
    Math.abs(percent).toFixed(2)+"%";

    document.getElementById("stockOwned").textContent=
    "Shares: "+stock.owned;

    document.getElementById("stockAverage").textContent=
    "Average Cost: $"+stock.averageCost.toFixed(2);

    document.getElementById("stockValue").textContent=
    "Market Value: $"+
    (stock.owned*stock.price).toFixed(2);

    const profit=(stock.price-stock.averageCost)*stock.owned;

    document.getElementById("stockProfit").textContent=
    (profit>=0?"+":"")+
    "$"+profit.toFixed(2);

    document.getElementById("stockRisk").textContent=
    "Risk: "+stock.risk;

    document.getElementById("stockDescription").textContent=
    stock.description;

    document.getElementById("shareQuantity").textContent=
    stockQuantity;

}

window.openStock = openStock;

document
.getElementById("closeStock")
.onclick=()=>{

document
.getElementById("stockPage")
.classList
.add("hidden");

};

document.getElementById("buyShare").onclick=()=>{

const stock=stocks[selectedStock];

const cost=stock.price*stockQuantity;

if(money<cost){

showAchievementPopup("Not enough money!");

return;

}

money-=cost;

stock.averageCost=

(stock.averageCost*stock.owned+cost)

/

(stock.owned+stockQuantity);

stock.owned+=stockQuantity;

updateUI();

openStock(selectedStock);

saveToCloud();

};

document.getElementById("sellShare").onclick=()=>{

const stock=stocks[selectedStock];

if(stock.owned<stockQuantity){

showAchievementPopup("Not enough shares!");

return;

}

money+=stock.price*stockQuantity;

stock.owned-=stockQuantity;

if(stock.owned==0)

stock.averageCost=0;

updateUI();

openStock(selectedStock);

savePortfolio();

saveToCloud();

};

function changeQuantity(amount){

stockQuantity+=amount;

if(stockQuantity<1)

stockQuantity=1;

openStock(selectedStock);

}

document.getElementById("plus1").onclick=()=>changeQuantity(1);

document.getElementById("plus10").onclick=()=>changeQuantity(10);

document.getElementById("plus100").onclick=()=>changeQuantity(100);

document.getElementById("minus1").onclick=()=>changeQuantity(-1);

document.getElementById("minus10").onclick=()=>changeQuantity(-10);

document.getElementById("minus100").onclick=()=>changeQuantity(-100);

function randomBetween(min,max){

return Math.random()*(max-min)+min;

}

function updateSingleStock(stock){

stock.previousPrice=stock.price;

stock.trend+=randomBetween(-.002,.002);

stock.trend*=.95;

stock.trend=Math.max(-.03,Math.min(.03,stock.trend));

const movement=

stock.trend+

randomBetween(

-stock.volatility,

stock.volatility

);

stock.price*=1+movement;

if(stock.price<1)

stock.price=1;

stock.history.push(stock.price);

if(stock.history.length>40)

stock.history.shift();

}

function updateStockMarket(){

stocks.forEach(updateSingleStock);

loadStocks();

if(!document.getElementById("stockPage").classList.contains("hidden"))

openStock(selectedStock);

savePortfolio();

saveToCloud();

}

setInterval(updateStockMarket,90000);
setInterval(saveMarket,90000);

async function savePortfolio(){

    if(!uid) return;

    const portfolio={};

    stocks.forEach(stock=>{

        portfolio[stock.ticker]={

            owned:stock.owned,

            averageCost:stock.averageCost

        };

    });

    await updateDoc(

        doc(db,"players",uid),

        {

            portfolio

        }

    );

}

async function loadMarket(){

    const docs=["CSH","GLD","TEC","CRY"];

    for(let i=0;i<docs.length;i++){

        const snap=await getDoc(

            doc(db,"market",docs[i])

        );

        if(snap.exists()){

            stocks[i]={

                ...stocks[i],

                ...snap.data()

            };

        }

    }

}

async function saveMarket(){

    for(const stock of stocks){

        await setDoc(

            doc(db,"market",stock.ticker),

            stock

        );

    }

}