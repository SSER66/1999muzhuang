// 在浏览器打开 木桩测试.html 后，把本文件内容粘贴到控制台执行。
// 目标：复现《数值修正.docx》中的虚构集大招暴击伤害 554250。
(() => {
  const expected = 554250;

  // 配置：共鸣15预设5塑虚构集，共鸣10预设2塑小瑞安侬，1塑莫莉德尔，0塑J
  setPortray('xg', 5);
  setPortray('ran', 2);
  setPortray('mld', 1);
  setPortray('j', 0);
  setResonanceMode('xg', 'r15');
  setResonanceMode('ran', 'r10');
  setResonanceMode('mld', 'r10');
  setResonanceMode('j', 'r10');
  newBattle();
  const xg = byId('xg');

  // 仅最终大招强制暴击，其余流程保持正常随机
  const origRandom = Math.random;

  const find = (charId, skillId, rank) =>
    S.hand.find(x => x.charId === charId && x.skillId === skillId && (rank === undefined || x.rank === rank));

  let checkSeq = 0;
  const ensure = (charId, skillId, rank) => {
    let c = find(charId, skillId, rank);
    if (!c && skillId === 'ult') {
      syncUltCard(byId(charId));
      c = find(charId, skillId, rank);
    }
    if (!c) {
      // 校验模式：随机发牌导致缺卡时直接置入，不影响 buff/状态结算
      checkSeq += 1;
      c = {
        charId,
        skillId,
        rank: skillId === 'ult' ? 0 : (rank || 1),
        uid: 'check-' + checkSeq
      };
      S.hand.unshift(c);
      console.log('置入', charId, skillId);
    }
    return c;
  };

  const play = (charId, skillId, rank) => {
    const c = ensure(charId, skillId, rank);
    playCard(c.uid);
  };

  // 第一回合
  console.log('step: 虚构故事集');
  play('xg', 'prep');   // 虚构故事集 -> 小瑞安侬唱予无忧之诗
  console.log('step: 唱予无忧之诗');
  play('ran', 'ult');   // 唱予无忧之诗
  console.log('step: 热处理');
  play('j', 's2');      // 热处理
  console.log('step: 将过往摧毁');
  play('mld', 's1');    // 将过往摧毁
  console.log('step: 词的意象');
  play('xg', 's2');     // 词的意象
  console.log('step: 结束回合1');
  endTurn();            // 进入第二回合

  // 第二回合
  console.log('step: 悄冥冥术阵1');
  play('ran', 's2');    // 悄冥冥术阵（加护）
  console.log('step: 悄冥冥术阵2');
  play('ran', 's2');    // 悄冥冥术阵（加护）
  console.log('step: 囫囵吞咒');
  play('ran', 's1');    // 囫囵吞咒（加护）
  console.log('step: 字的隐喻1');
  play('xg', 's1');     // 字的隐喻

  // 移动字的隐喻，且不触发合卡
  console.log('step: 移动字的隐喻');
  const moveCard = ensure('xg', 's1');
  const mi = S.hand.indexOf(moveCard);
  let moved = false;
  for (let t = 0; t <= S.hand.length; t++) {
    if (t === mi) continue;
    const after = S.hand.slice();
    const [card] = after.splice(mi, 1);
    let tt = t;
    if (tt > mi) tt -= 1;
    after.splice(Math.max(0, Math.min(tt, after.length)), 0, card);
    const ni = after.indexOf(card);
    const neighbors = [after[ni - 1], after[ni + 1]].filter(Boolean);
    const noMerge = neighbors.every(o =>
      o.skillId === 'ult' || o.skillId === 'prep' ||
      !(o.charId === card.charId && o.skillId === card.skillId && o.rank === card.rank));
    if (noMerge) {
      startMove(card.uid);
      moveTo(card.uid, t);
      moved = true;
      break;
    }
  }
  if (!moved) throw new Error('找不到不会合成的位置');

  console.log('step: 字的隐喻2');
  play('xg', 's1');     // 字的隐喻
  console.log('step: 词的意象2');
  play('xg', 's2');     // 词的意象

  // 释放虚构集大招并抓取伤害
  console.log('step: 虚构集大招');
  const ult = ensure('xg', 'ult');
  const preUlt = {
    d: xg.status['独白'] ? xg.status['独白'].stacks : 0,
    g: xg.status['群像'] ? xg.status['群像'].stacks : 0,
    passion: xg.passion,
    stats: Object.assign({}, xg.stats),
    status: Object.assign({}, xg.status),
    teamBuffs: JSON.parse(JSON.stringify(S.teamBuffs)),
    mldZhanbei: byId('mld').status['战备'] ? byId('mld').status['战备'].stacks : 0,
    zbDeploy: xg.status['战备部署'] ? xg.status['战备部署'].stacks : 0
  };
  const origCalc = calcHit;
  let actual = null;
  let ultCalc = null;
  calcHit = function(c, o) {
    const isUlt = c.id === 'xg' && o.isUlt;
    if (isUlt) Math.random = () => 0;
    const r = origCalc(c, o);
    if (isUlt) Math.random = origRandom;
    if (isUlt) {
      actual = r.dmg;
      ultCalc = {
        opts: Object.assign({}, o),
        r: Object.assign({}, r),
        stats: Object.assign({}, c.stats),
        mldZhanbei: byId('mld').status['战备'] ? byId('mld').status['战备'].stacks : 0,
        zbDeploy: c.status['战备部署'] ? c.status['战备部署'].stacks : 0
      };
    }
    return r;
  };
  playCard(ult.uid);
  calcHit = origCalc;
  Math.random = origRandom;

  // 差异分析（2026-08-07）：
  // 网页威力项 = 4.394（仪式威力 339.4%），文档 554250 对应威力项约 2.15（仪式威力约 115%）。
  // 疑似原因：狂想Ⅱ“每额外激情仪式威力”与“最后的投掷”叠加后翻倍，导致威力项过高。
  return {
    expected,
    actual,
    match: actual === expected,
    diff: actual === null ? null : actual - expected,
    preUlt,
    ultCalc,
    ranStatus: byId('ran').status,
    mldStatus: byId('mld').status,
    jStatus: byId('j').status
  };
})();
