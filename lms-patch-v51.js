// LMS Patch v5.1 — Clé LFA uniquement (sans mot de passe)
// Override authShowView + doLoginApprenant
// VoteConnect SARL | Coach Morgan's

(function () {
  'use strict';

  function patchLoginView() {
    var tabIns = document.getElementById('tab-inscrire-btn');
    if (tabIns) tabIns.style.display = 'none';

    var pwdInput = document.getElementById('app-login-pwd');
    if (pwdInput) {
      var pwdGroup = pwdInput.closest ? pwdInput.closest('.form-group') : pwdInput.parentNode;
      if (pwdGroup) pwdGroup.style.display = 'none';
    }

    var nameInput = document.getElementById('app-login-name');
    if (nameInput) {
      nameInput.placeholder = 'LFA-2026-XXXX';
      nameInput.style.fontFamily = 'monospace';
      nameInput.style.letterSpacing = '2px';
      nameInput.style.textTransform = 'uppercase';
      nameInput.style.fontSize = '15px';
      nameInput.addEventListener('input', function () { this.value = this.value.toUpperCase(); });
    }

    var nameGroup = nameInput && (nameInput.closest ? nameInput.closest('.form-group') : nameInput.parentNode);
    if (nameGroup) {
      var lbl = nameGroup.querySelector('label');
      if (lbl) lbl.textContent = 'Clé LFA — format : LFA-2026-XXXX';
    }

    if (!document.getElementById('lfa-key-hint')) {
      var connDiv = document.getElementById('auth-sub-connexion');
      if (connDiv) {
        var hintEl = document.createElement('div');
        hintEl.id = 'lfa-key-hint';
        hintEl.style.cssText = 'font-size:11px;color:#8a9490;margin-bottom:12px;padding:9px 12px;background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);border-radius:8px;line-height:1.6';
        hintEl.innerHTML = '📌 Saisissez votre <strong>Clé LFA</strong> reçue par WhatsApp après paiement Wave.<br><span style="color:#22a852">Pas de mot de passe requis.</span>';
        var btn = connDiv.querySelector('button');
        if (btn) connDiv.insertBefore(hintEl, btn);
        else connDiv.appendChild(hintEl);
      }
    }
  }

  function hookAuthShowView() {
    var orig = window.authShowView;
    if (!orig) { setTimeout(hookAuthShowView, 200); return; }
    window.authShowView = function (view) {
      orig(view);
      if (view === 'login-apprenant') setTimeout(patchLoginView, 80);
    };
  }

  function hookDoLogin() {
    window.doLoginApprenant = function () {
      var keyInput = document.getElementById('app-login-name');
      if (!keyInput) return;
      var key = keyInput.value.trim().toUpperCase();
      var errEl = document.getElementById('auth-error');
      function showErr(msg) {
        if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
        setTimeout(function () { if (errEl) errEl.style.display = 'none'; }, 4500);
      }
      if (!key || key.length < 8) { showErr('⚠️ Entrez votre Clé LFA (ex : LFA-2026-ABCD).'); return; }
      var users = {};
      try { var v = localStorage.getItem('cf2_users_registry'); if (v) users = JSON.parse(v); } catch (e) {}
      var found = null;
      Object.keys(users).forEach(function (k) {
        var u = users[k];
        if ((u.inviteCode && u.inviteCode.toUpperCase() === key) ||
            (u.cle_lfa && u.cle_lfa.toUpperCase() === key) ||
            (u.ref && u.ref.toUpperCase() === key)) { found = u; }
      });
      if (!found) { showErr('❌ Clé LFA invalide. Contactez : +225 07 67 56 09 08'); return; }
      if (found.status === 'pending') { showErr('⏳ Compte en attente de validation Admin.'); return; }
      if (found.status === 'blocked') { showErr('🚫 Compte suspendu. Contactez Admin.'); return; }
      window.currentUser = { name: found.fullName, fullName: found.fullName, role: 'apprenant', zone: found.zone || '', cat: found.cat || '', ref: found.ref || key, inviteCode: key, status: found.status || 'active' };
      try { localStorage.setItem('cf2_last_user2', JSON.stringify(window.currentUser)); } catch (e) {}
      if (typeof window.initApp === 'function') window.initApp();
    };
  }

  function startObserver() {
    var obs = new MutationObserver(function () {
      var av = document.querySelector('.coach-big-avatar');
      if (av && !av.querySelector('img')) {
        av.innerHTML = '<img src="https://i.ibb.co/VWp3SGvq/Simplice-KOUAME.png" alt="Coach Morgan\'s" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:3px solid #c9a84c">';
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function init() { hookAuthShowView(); hookDoLogin(); startObserver(); console.log('[LMS-PATCH v5.1] Cle LFA-only active'); }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
