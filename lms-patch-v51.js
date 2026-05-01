// LMS Patch v5.1 — Single LFA Key Auth
// Connexion unique par Clé LFA-2026-XXXX · Pas de mot de passe · Pas de S'inscrire
// MutationObserver Coach photo injection
// VoteConnect SARL | Coach Morgan's

(function () {
  'use strict';

  function applyPatch() {

    // 1. Masquer le bouton S'inscrire
    var tabIns = document.getElementById('tab-inscrire-btn');
    if (tabIns) tabIns.style.display = 'none';

    // 2. Remplacer le formulaire de connexion par un champ Clé LFA unique
    var loginForm = document.getElementById('auth-sub-connexion');
    if (loginForm) {
      loginForm.innerHTML =
        '<div class="form-group">' +
          '<label>Clé LFA — format : LFA-2026-XXXX</label>' +
          '<input type="text" id="app-login-name" ' +
            'placeholder="LFA-2026-XXXX" ' +
            'style="font-family:monospace;letter-spacing:2px;text-transform:uppercase;font-size:15px" ' +
            'oninput="this.value=this.value.toUpperCase()" ' +
            'onkeydown="if(event.key===\'Enter\')doLoginApprenant()">' +
        '</div>' +
        '<div style="font-size:11px;color:var(--gr);margin-bottom:14px;padding:10px 13px;' +
          'background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);' +
          'border-radius:8px;line-height:1.6">' +
          '📌 Saisissez votre <strong>Clé LFA</strong> reçue après paiement Wave.<br>' +
          'Format : <strong style="font-family:monospace;color:var(--orc)">LFA-2026-XXXX</strong><br>' +
          '<span style="color:var(--vv)">Pas de mot de passe requis.</span>' +
        '</div>' +
        '<button class="btn-primary" onclick="doLoginApprenant()">Accéder avec ma Clé LFA →</button>';
    }

    // 3. Override doLoginApprenant : validation par Clé LFA uniquement
    window.doLoginApprenant = function () {
      var keyRaw = document.getElementById('app-login-name');
      if (!keyRaw) return;
      var key = keyRaw.value.trim().toUpperCase();
      var errEl = document.getElementById('auth-error');

      function showErr(msg) {
        if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
        setTimeout(function () { if (errEl) errEl.style.display = 'none'; }, 4000);
      }

      if (!key || key.length < 8) { showErr('⚠️ Entrez votre Clé LFA (ex: LFA-2026-ABCD).'); return; }

      // Chercher dans le registre local
      var users = {};
      try { var v = localStorage.getItem('cf2_users_registry'); if (v) users = JSON.parse(v); } catch (e) {}

      var found = null;
      Object.keys(users).forEach(function (k) {
        var u = users[k];
        if (
          (u.inviteCode && u.inviteCode.toUpperCase() === key) ||
          (u.cle_lfa && u.cle_lfa.toUpperCase() === key) ||
          (u.ref && u.ref.toUpperCase() === key)
        ) { found = u; }
      });

      if (!found) { showErr('❌ Clé LFA invalide ou non enregistrée. Contactez l\'Admin : +225 07 67 56 09 08'); return; }
      if (found.status === 'pending') { showErr('⏳ Compte en attente de validation par l\'Administrateur.'); return; }
      if (found.status === 'blocked') { showErr('🚫 Compte suspendu. Contactez l\'Admin : +225 07 67 56 09 08'); return; }

      window.currentUser = {
        name: found.fullName,
        fullName: found.fullName,
        role: 'apprenant',
        zone: found.zone || '',
        cat: found.cat || '',
        ref: found.ref || key,
        inviteCode: key,
        status: found.status || 'active'
      };
      try { localStorage.setItem('cf2_last_user2', JSON.stringify(window.currentUser)); } catch (e) {}
      if (typeof window.initApp === 'function') window.initApp();
      else console.error('[LMS-PATCH] initApp() introuvable.');
    };

    // 4. MutationObserver — injection photo Coach Morgan's
    var observer = new MutationObserver(function () {
      var av = document.querySelector('.coach-big-avatar');
      if (av && !av.querySelector('img')) {
        av.innerHTML = '<img src="https://i.ibb.co/VWp3SGvq/Simplice-KOUAME.png" ' +
          'alt="Simplice KOUAME — Coach Morgan\'s" ' +
          'style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:3px solid var(--or)">';
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[LMS-PATCH v5.1] Clé LFA-only auth activée ✅');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPatch);
  } else {
    setTimeout(applyPatch, 100);
  }

})();
