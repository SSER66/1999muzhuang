const fs = require("fs");
const s = fs.readFileSync("D:/职/木桩/木桩DPR/木桩测试.html", "utf8");
const m = s.match(/<script>([\s\S]*?)<\/script>/);
new Function(m[1]);
console.log("syntax ok");

console.log("tuning panel:", s.includes('id="tuningSelect"') && s.includes('id="tuningPanel"'));

const nb = s.slice(s.indexOf("function newBattle"), s.indexOf("function buildDeck"));
console.log("newBattle tuning:", nb.includes('S.tuning =') && nb.includes('S.tuningEnergy =') && nb.includes('S.tuningSkill1Cost =') && nb.includes('start-extra-'));

const hs = s.slice(s.indexOf("function handLimit"), s.indexOf("function addPrepStacks"));
console.log("handLimit/addTuningEnergy:", hs.includes("return S.tuning === \"unfinished\" ? 9 : 8;") && hs.includes("Math.min(99, S.tuningEnergy + n)"));

const pc = s.slice(s.indexOf("function playCard"), s.indexOf("function castAttack"));
console.log("playCard tuning:", pc.includes('card.skillId === "universal"') && pc.includes("if (!isUlt) addTuningEnergy(4);"));

const mt = s.slice(s.indexOf("function startMove"), s.indexOf("function selectCard"));
console.log("move universal:", mt.includes('const freeMove = card.skillId === "universal"') && mt.includes('if (card.skillId !== "ult") addTuningEnergy(3);'));

const mg = s.slice(s.indexOf("function mergeCards"), s.indexOf("function canMergeWith"));
console.log("merge universal+energy:", mg.includes('const uni = a.skillId === "universal"') && mg.includes('addTuningEnergy(S.tuning === "initial" ? 2 : 5);') && mg.includes("delete other.tuningTemp;"));

const cm = s.slice(s.indexOf("function canMergeWith"), s.indexOf("function clearLog"));
console.log("canMerge universal:", cm.includes('card.skillId === "universal"') && cm.includes('other.skillId === "universal"'));

const rh = s.slice(s.indexOf("function renderHand"), s.indexOf("function startMove"));
console.log("renderHand universal:", rh.includes('const isUniversal = card.skillId === "universal"') && rh.includes("调律·万能") && !rh.includes("playCard(\\'\" + card.uid + \\')") === false);

const rr = s.slice(s.indexOf("function releaseRhiannon"), s.indexOf("function endTurn"));
console.log("releaseRhiannon handLimit:", rr.includes("drawCards(handLimit());"));

const et = s.slice(s.indexOf("function endTurn"), s.indexOf("function tickStatuses"));
console.log("endTurn temp removal:", et.includes("S.hand = S.hand.filter(x => !x.tuningTemp);"));

console.log("render calls renderTuning:", s.slice(s.indexOf("function render()"), s.indexOf("function renderDummy")).includes("renderTuning();"));
console.log("tuning funcs:", s.includes("function setTuning") && s.includes("function renderTuning") && s.includes("function useTuningSkill1") && s.includes("function useTuningSkill2") && s.includes("function randomizeHandRanks"));
console.log("randomize rank fix:", s.includes("let oldRank = card.rank;") && s.includes("if (!oldRank || oldRank < 1) oldRank = 1;"));
