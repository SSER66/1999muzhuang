// 状态版校验：不模拟出牌，直接按手动测试的最终状态结算虚构集大招。
// 在浏览器打开 木桩测试.html 后，把本文件内容粘贴到控制台执行。
(() => {
  const expectedWeb = 506495;   // 用户手动网页测试
  const expectedGame = 396558;  // 用户给出的游戏对照值

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
  // 木桩设置：现实防御1600，暴击防御30%，受创减免60%
  dummy().defR = 1600;
  dummy().critDef = 30;
  dummy().traumaRes = 60;

  const xg = byId('xg');
  const mld = byId('mld');
  const j = byId('j');

  // 最终状态：15群像 20独白，13激情
  xg.status['群像'] = { stacks: 15, dur: 0 };
  xg.status['独白'] = { stacks: 20, dur: 0 };
  xg.status['战备部署'] = { stacks: 20, dur: 1 };
  addStatus(xg.status, '尘酿鹰', 0, 2);
  xg.passion = 13;

  // 队伍 buff：昨日3层=7.2%，家庭10层=8%，群鸟45%，加护30%，灵犀7层
  S.teamBuffs.traumaUp = [
    { name: '加护', v: 30, d: 3 }
  ];
  S.teamBuffs.dmgUp = [{ name: '昨日雨声轻', v: 7.2, d: 3 }];
  S.teamBuffs.spellPower = [{ name: '群鸟之歌', v: 45, d: 3 }];
  S.teamBuffs.ritualPower = [{ name: '群鸟之歌', v: 45, d: 3 }];
  S.teamBuffs.critDmgUp = [
    { name: '昨日雨声轻', v: 16, d: 3 },
    { name: '家庭指导员', v: 8, d: 1 }
  ];
  S.teamBuffs.lingxi = { stacks: 7, dur: 3 };
  mld.status['战备'] = { stacks: 33, batches: [{ stacks: 33, dur: 3 }] };
  j.status['燃烧'] = { stacks: 8, dur: 0 };
  // 小瑞安侬局内 buff：悄冥冥术阵攻击+12%，囫囵吞咒生命+12%
  byId('ran').buffs.atkUp = { v: 12, d: 3 };
  byId('ran').buffs.maxHpUp = { v: 12, d: 3 };

  refreshStats();
  syncUltCard(xg);

  const ult = S.hand.find(x => x.charId === 'xg' && x.skillId === 'ult');
  const preUlt = {
    d: xg.status['独白'] ? xg.status['独白'].stacks : 0,
    g: xg.status['群像'] ? xg.status['群像'].stacks : 0,
    passion: xg.passion,
    stats: Object.assign({}, xg.stats),
    teamBuffs: JSON.parse(JSON.stringify(S.teamBuffs)),
    zbDeploy: xg.status['战备部署'] ? xg.status['战备部署'].stacks : 0
  };

  const origRandom = Math.random;
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
        stats: Object.assign({}, c.stats)
      };
    }
    return r;
  };
  playCard(ult.uid);
  calcHit = origCalc;
  Math.random = origRandom;

  return {
    expectedWeb,
    expectedGame,
    actual,
    matchWeb: actual === expectedWeb,
    diffWeb: actual - expectedWeb,
    preUlt,
    ultCalc
  };
})();
