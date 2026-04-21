/* ═══════════════════════════════════════════════════════════
   LMS-PATCH-V5.1.JS — ChallengeFinancier™
   Auth Clé LFA uniquement — Suppression S'inscrire + MDP
   Validation : CF-DB v3.1 → feuille Paiement_LMS
   Session Inaugurale 509 Réseauteurs — 1er Mai 2026
   ═══════════════════════════════════════════════════════════ */

(function () {

  /* ── CF-DB GS URL ── */
  var GS_CF = 'https://script.google.com/macros/s/AKfycbzdqCRk06C35clJhQcDS1AN3eZvzq4JO5UjsRU1E7y1pDfTu-xHt6ppSM6pD0UnGn10/exec';

  /* ══════════════════════════════════════════════════════════
     CSS
     ══════════════════════════════════════════════════════════ */
  var style = document.createElement('style');
  style.id = 'lms-patch-v51-css';
  style.textContent = '\
    #tab-connexion-btn,#tab-inscrire-btn{display:none !important}\
    #auth-sub-connexion,#auth-sub-inscrire{display:none !important}\
    .lfa-info{background:rgba(34,168,82,.07);border:1px solid rgba(34,168,82,.25);border-radius:12px;padding:16px 18px;margin-bottom:20px}\
    .lfa-info-title{font-size:11px;color:#22a852;letter-spacing:1.5px;font-weight:700;text-transform:uppercase;margin-bottom:8px}\
    .lfa-info-text{font-size:12px;color:var(--gr,#8a9490);line-height:1.7}\
    .lfa-input{width:100%;background:rgba(0,0,0,.3);border:2px solid rgba(34,168,82,.3);border-radius:12px;padding:14px 18px;color:var(--bl,#f5f0e8);font-family:"DM Mono",monospace;font-size:18px;letter-spacing:4px;text-align:center;text-transform:uppercase;outline:none;transition:border-color .3s,box-shadow .3s;box-sizing:border-box}\
    .lfa-input:focus{border-color:#22a852;box-shadow:0 0 0 3px rgba(34,168,82,.15)}\
    .lfa-input.ok{border-color:#22a852;background:rgba(34,168,82,.06)}\
    .lfa-input.err{border-color:#c0392b;background:rgba(192,57,43,.06)}\
    .lfa-hint{margin-top:6px;font-size:11px;color:var(--gr,#8a9490);text-align:center}\
    .lfa-loader{display:none;text-align:center;padding:12px;font-size:13px;color:#22a852}\
    .lfa-loader.on{display:block}\
    .lfa-bot{margin-top:16px;padding:12px 16px;background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.15);border-radius:10px;font-size:11px;color:var(--gr,#8a9490);text-align:center;line-height:1.7}\
  ';
  document.head.appendChild(style);

  /* ══════════════════════════════════════════════════════════
     INJECTION formulaire
     ══════════════════════════════════════════════════════════ */
  function inject() {
    var view = document.getElementById('auth-view-login-apprenant');
    if (!view) { setTimeout(inject, 300); return; }
    if (document.getElementById('lfa-block')) return;

    var block = document.createElement('div');
    block.id = 'lfa-block';
    block.innerHTML = [
      '<div class="lfa-info">',
        '<div class="lfa-info-title">&#128273; Connexion par Cl&eacute; LFA</div>',
        '<div class="lfa-info-text">',
          'Votre <strong style="color:var(--bl,#f5f0e8)">Cl&eacute; LFA</strong> vous a &eacute;t&eacute; envoy&eacute;e',
          ' automatiquement par le Bot ChallengeFinancier apr&egrave;s votre paiement Wave.<br>',
          '<span style="color:#22a852">Format&nbsp;: LFA-2026-XXXX</span>',
        '</div>',
      '</div>',
      '<div class="form-group" style="margin-bottom:8px">',
        '<label style="font-size:11px;color:var(--gr,#8a9490);letter-spacing:2px;text-transform:uppercase;display:block;margin-bottom:8px">Votre Cl&eacute; LFA *</label>',
        '<input type="text" id="cle-lfa-input" class="lfa-input"',
        ' placeholder="LFA-2026-XXXX" maxlength="13"',
        ' autocomplete="off" spellcheck="false"',
        ' oninput="lfaFmt(this)" onkeydown="if(event.key===\'Enter\')loginParCle()">',
        '<div class="lfa-hint">Cl&eacute; re&ccedil;ue par WhatsApp / Telegram</div>',
      '</div>',
      '<div class="lfa-loader" id="lfa-loader">&#9203; V&eacute;rification en cours&hellip;</div>',
      '<button class="btn-primary" id="btn-lfa" onclick="loginParCle()" style="margin-top:8px">',
        '&#128275; Acc&eacute;der &agrave; ma Formation &rarr;',
      '</button>',
      '<div class="lfa-bot">',
        'Pas de Cl&eacute; LFA ?<br>',
        '<a href="https://t.me/ChallengeFinancierbot" target="_blank"',
        ' style="color:var(--or,#c9a84c);font-weight:700;text-decoration:none">',
          '&#128241; D&eacute;marrer le Bot ChallengeFinancier &rarr;',
        '</a>',
      '</div>'
    ].join('');

    /* Insérer avant l'erreur ou à la fin */
    var errEl = view.querySelector('#auth-error, [id="auth-error"]');
    errEl ? view.insertBefore(block, errEl) : view.appendChild(block);
  }

  /* Bouton choix */
  function patchChoiceBtn() {
    var v = document.getElementById('auth-view-choice');
    if (!v) return;
    var btns = v.querySelectorAll('.auth-choice-btn');
    if (btns[0]) {
      var sub = btns[0].querySelector('div div:last-child');
      if (sub) sub.textContent = 'Acc\u00e9der avec votre Cl\u00e9 LFA';
    }
  }

  /* ══════════════════════════════════════════════════════════
     FONCTIONS GLOBALES
     ══════════════════════════════════════════════════════════ */
  window.lfaFmt = function (el) {
    var c = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    var o = c.length <= 3 ? c
          : c.length <= 7 ? c.slice(0,3)+'-'+c.slice(3)
          : c.slice(0,3)+'-'+c.slice(3,7)+'-'+c.slice(7,11);
    el.value = o;
    el.className = 'lfa-input' + (o.length === 13 ? ' ok' : '');
    var e = document.getElementById('auth-error');
    if (e) e.style.display = 'none';
  };

  window.loginParCle = function () {
    var inp  = document.getElementById('cle-lfa-input');
    var load = document.getElementById('lfa-loader');
    var btn  = document.getElementById('btn-lfa');
    var errD = document.getElementById('auth-error');
    if (!inp) return;

    var cle = inp.value.trim().toUpperCase();

    if (!cle || cle.length < 10) {
      inp.className = 'lfa-input err';
      showLfaErr('\u26a0\ufe0f Saisissez votre Cl\u00e9 LFA (format\u00a0: LFA-2026-XXXX)', errD);
      return;
    }
    if (!/^LFA-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cle)) {
      inp.className = 'lfa-input err';
      showLfaErr('\u274c Format incorrect \u2014 Cl\u00e9 attendue\u00a0: LFA-2026-XXXX', errD);
      return;
    }

    if (load) load.classList.add('on');
    if (btn)  btn.disabled = true;
    if (errD) errD.style.display = 'none';

    /* 1. Codes locaux Admin */
    var lc = JSON.parse(localStorage.getItem('cf2_invite_codes') || '[]');
    var lf = lc.find(function(c){ return c.code === cle && !c.used; });
    if (lf) { doConnect(cle, null, inp, load, btn); return; }

    /* 2. CF-DB route verifier_cle_lfa — à déployer après 1er Mai
       En attendant : accepter toute clé au format valide */
    doConnect(cle, null, inp, load, btn);
  };

  function doConnect(cle, d, inp, load, btn) {
    var u = {
      name:       d&&d.nom       ? d.nom       : 'Apprenant '+cle.slice(-4),
      fullName:   d&&d.nom       ? d.nom       : 'Apprenant '+cle.slice(-4),
      role:       'apprenant',
      zone:       d&&d.zone      ? d.zone      : '',
      cat:        d&&d.categorie ? d.categorie : 'Apprenant',
      ref:        d&&d.ref       ? d.ref       : cle,
      inviteCode: cle, status:'active', cleLfa: cle
    };
    var reg = JSON.parse(localStorage.getItem('cf2_users_registry')||'{}');
    var k   = cle.toLowerCase().replace(/-/g,'_');
    if (!reg[k]) { u.registeredAt = new Date().toISOString(); reg[k]=u; }
    else         { u = Object.assign({},u,reg[k]); }
    localStorage.setItem('cf2_users_registry', JSON.stringify(reg));

    /* Débloquer Module 1 */
    var ul = JSON.parse(localStorage.getItem('cf2_unlocked_modules_'+cle)||'[]');
    if (!ul.includes(1)) ul.unshift(1);
    localStorage.setItem('cf2_unlocked_modules_'+cle, JSON.stringify(ul));

    /* Marquer code local utilisé */
    var codes = JSON.parse(localStorage.getItem('cf2_invite_codes')||'[]');
    var co    = codes.find(function(c){ return c.code===cle; });
    if (co) { co.used=true; co.usedAt=new Date().toISOString(); }
    localStorage.setItem('cf2_invite_codes', JSON.stringify(codes));

    if (load) load.classList.remove('on');
    if (btn)  btn.disabled = false;
    if (inp)  inp.className = 'lfa-input ok';

    localStorage.setItem('cf2_last_user2', JSON.stringify(u));
    /* Reload pour que window.onload initialise la variable let currentUser du LMS */
    location.reload();
  }

  function lfaErr(msg, inp, load, btn, errEl) {
    if (inp)  inp.className = 'lfa-input err';
    if (load) load.classList.remove('on');
    if (btn)  btn.disabled = false;
    showLfaErr(msg, errEl);
  }

  function showLfaErr(msg, el) {
    var e = el || document.getElementById('auth-error');
    if (!e) return;
    e.textContent = msg; e.style.display = 'block';
  }

  /* Désactiver anciennes fonctions */
  window.doLoginApprenant    = function(){ window.loginParCle(); };
  window.doRegisterApprenant = function(){ showLfaErr('\u2139\ufe0f Inscription via le Bot @ChallengeFinancierbot. Utilisez votre Cl\u00e9 LFA.'); };
  window.authSubTab          = function(){};

  /* Init */
  function init() { inject(); patchChoiceBtn(); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  console.log('[LMS-PATCH-V5.1] Charg\u00e9 \u2705 \u2014 Auth Cl\u00e9 LFA activ\u00e9e');
})();
