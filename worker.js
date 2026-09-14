export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname;

    function generaToken() {
      return 'tok-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async function hashPassword(password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function verificaSessione(token) {
      if (!token) return null;
      return await env.DB.prepare("SELECT * FROM sessioni WHERE token=? AND scadenza>?").bind(token, Date.now()).first();
    }

    async function creaNotifica(tipo, titolo, messaggio, dati) {
      const id = 'not-' + Date.now();
      await env.DB.prepare(
        "INSERT INTO notifiche (id, tipo, titolo, messaggio, dati, letto, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, tipo, titolo, messaggio, JSON.stringify(dati), 0, new Date().toISOString()).run();
    }

    async function generaIdCliente(studioId) {
      const result = await env.DB.prepare(
        "SELECT id FROM anagrafica_clienti WHERE studio_id=? ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1"
      ).bind(studioId).first();
      let prossimoNumero = 1;
      if (result && result.id) {
        const numeroEsistente = parseInt(result.id.replace('CLI-', ''));
        prossimoNumero = numeroEsistente + 1;
      }
      return 'CLI-' + String(prossimoNumero).padStart(5, '0');
    }

    function generaUsername(nome, cognome) {
      const base = (nome + '.' + cognome).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      const numero = Math.floor(Math.random() * 9000) + 1000;
      return base + numero;
    }

    function generaPassword() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    try {
      // ============================================
      // 1. LOGIN
      // ============================================
      if (path === "/api/auth/login" && request.method === "POST") {
        const { tipo, id, password } = await request.json();
        const hashedPassword = await hashPassword(password);
        let user = null;
        if (tipo === 'admin' && id === "admin" && password === "58879@Stella") {
          user = { id: 'admin', nome: 'Super Admin' };
        } else if (tipo === 'studio') {
          user = await env.DB.prepare("SELECT * FROM studi WHERE id=? AND (password=? OR password=?) AND attivo=1").bind(id, 'hash:' + hashedPassword, password).first();
        } else if (tipo === 'cliente') {
          user = await env.DB.prepare("SELECT * FROM clienti WHERE id=? AND (password=? OR password=?)").bind(id, 'hash:' + hashedPassword, password).first();
        }
        if (user) {
          const token = generaToken();
          const scadenza = Date.now() + (8 * 60 * 60 * 1000);
          await env.DB.prepare("INSERT OR REPLACE INTO sessioni (token, user_id, tipo, scadenza) VALUES (?, ?, ?, ?)").bind(token, user.id, tipo, scadenza).run();
          return new Response(JSON.stringify({ success: true, token, nome: user.nome || user.nome_a }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Credenziali non valide o account disattivato" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 2. VERIFICA SESSIONE
      // ============================================
      if (path === "/api/auth/verifica" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (sess) {
          let userData = null;
          if (sess.tipo === 'studio') userData = await env.DB.prepare("SELECT * FROM studi WHERE id=?").bind(sess.user_id).first();
          else if (sess.tipo === 'cliente') userData = await env.DB.prepare("SELECT * FROM clienti WHERE id=?").bind(sess.user_id).first();
          return new Response(JSON.stringify({ success: true, tipo: sess.tipo, user: userData }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Sessione scaduta" }), { status: 401, headers: corsHeaders });
      }

      // ============================================
      // 3. LOGOUT
      // ============================================
      if (path === "/api/auth/logout" && request.method === "POST") {
        const { token } = await request.json();
        await env.DB.prepare("DELETE FROM sessioni WHERE token=?").bind(token).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 24-27. WORKFLOW (Studio)
      // ============================================
      if (path === "/api/studio/workflow" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const studioId = url.searchParams.get("studioId") || sess.user_id;
        const result = await env.DB.prepare("SELECT * FROM workflow WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, workflow: result.results.map(w => ({ ...w, tasks: JSON.parse(w.note || '{}') })) }), { headers: corsHeaders });
      }
      if (path === "/api/studio/workflow" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO workflow (id, studio_id, cliente_id, nome_cliente, tipo_servizio, data_servizio, note, data_creazione, ultimo_aggiornamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente_id || '', d.nome_cliente || '', d.tipo_servizio || '', d.data_servizio || null, JSON.stringify(d.tasks || {}), d.data_creazione || new Date().toISOString(), new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/workflow/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/workflow/")[1];
        const d = await request.json();
        await env.DB.prepare(`UPDATE workflow SET note=?, ultimo_aggiornamento=? WHERE id=?`).bind(JSON.stringify(d.tasks || {}), new Date().toISOString(), id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }
      if (path.startsWith("/api/studio/workflow/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const id = path.split("/api/studio/workflow/")[1];
        await env.DB.prepare("DELETE FROM workflow WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 70-75. ANAGRAFICA CLIENTI (Studio)
      // ============================================
      if (path === "/api/studio/anagrafica-clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM anagrafica_clienti WHERE studio_id=? ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) ASC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }
      if (path === "/api/studio/anagrafica-clienti/ricerca" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const q = (url.searchParams.get("q") || '').toLowerCase();
        const result = await env.DB.prepare(
          "SELECT id, nome, cognome, email, telefono FROM anagrafica_clienti WHERE studio_id=? AND (LOWER(id) LIKE ? OR LOWER(nome) LIKE ? OR LOWER(cognome) LIKE ? OR LOWER(email) LIKE ?) ORDER BY cognome, nome LIMIT 20"
        ).bind(sess.user_id, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 76-87. SELEZIONE ALBUM (Studio & Public)
      // ============================================
      if (path === "/api/studio/selezione-album/crea" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const cliente = await env.DB.prepare("SELECT * FROM anagrafica_clienti WHERE id=? AND studio_id=?").bind(d.cliente_id, sess.user_id).first();
        if (!cliente) return new Response(JSON.stringify({ error: "Cliente non trovato" }), { status: 404, headers: corsHeaders });
        const username = (cliente.nome || 'cl').substring(0, 2).toLowerCase() + Math.floor(10 + Math.random() * 90);
        const password = Math.random().toString(36).substring(2, 4).toUpperCase() + Math.floor(10 + Math.random() * 90);
        const id = 'sel-' + Date.now();
        const dataScadenza = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare("INSERT INTO selezioni_album (id, studio_id, cliente_id, cliente_nome, username, password, stato, data_creazione, data_scadenza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, sess.user_id, d.cliente_id, cliente.nome + ' ' + cliente.cognome, username, password, 'in_attesa', new Date().toISOString(), dataScadenza).run();
        const linkPubblico = `https://cibox72.github.io/AppCenterStudioPROGOLD/selezione-album-cliente.html?id=${id}&token=${token}`;
        return new Response(JSON.stringify({ success: true, id, username, password, link: linkPubblico, scadenza: dataScadenza }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezioni-album" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const result = await env.DB.prepare("SELECT * FROM selezioni_album WHERE studio_id=? ORDER BY data_creazione DESC").bind(sess.user_id).all();
        return new Response(JSON.stringify({ success: true, selezioni: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/upload-cartella" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const formData = await request.formData();
        const selezioneId = formData.get('selezione_id');
        const nomeCartella = formData.get('nome_cartella');
        const clienteId = formData.get('cliente_id');
        const files = formData.getAll('files');
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
        const prefix = `selezioni/${sess.user_id}/${clienteId}/${selezioneId}/${nomeCartella}/`;
        let uploadCount = 0;
        for (const file of files) {
          try {
            const key = prefix + file.name;
            await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
            uploadCount++;
          } catch (e) { console.error('Errore upload file:', e); }
        }
        return new Response(JSON.stringify({ success: true, uploaded: uploadCount }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/elimina-cartella" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          const prefix = `selezioni/${sess.user_id}/${d.cliente_id}/${d.selezione_id}/${d.nome_cartella}/`;
          const objects = await bucket.list({ prefix });
          if (objects.objects.length > 0) await bucket.delete(objects.objects.map(obj => obj.key));
        }
        return new Response(JSON.stringify({ success: true, eliminated: 1 }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/elimina" && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND studio_id=?").bind(d.selezione_id, sess.user_id).first();
        if (selezione) {
          const bucket = env.appcenter_studio_foto;
          if (bucket) {
            const prefix = `selezioni/${sess.user_id}/${selezione.cliente_id}/${selezione.id}/`;
            const objects = await bucket.list({ prefix });
            if (objects.objects.length > 0) await bucket.delete(objects.objects.map(obj => obj.key));
          }
        }
        await env.DB.prepare("DELETE FROM selezioni_album WHERE id=?").bind(d.selezione_id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/selezione-album/scarica" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });
        const d = await request.json();
        const selezione = await env.DB.prepare("SELECT * FROM selezioni_album WHERE id=? AND studio_id=?").bind(d.selezione_id, sess.user_id).first();
        if (!selezione) return new Response(JSON.stringify({ error: "Selezione non trovata" }), { status: 404, headers: corsHeaders });
        const bucket = env.appcenter_studio_foto;
        const files = [];
        if (bucket) {
          const prefix = `selezioni/${sess.user_id}/${selezione.cliente_id}/${selezione.id}/`;
          const objects = await bucket.list({ prefix });
          for (const obj of objects.objects) {
            if (obj.key.endsWith('.txt')) {
              const content = await bucket.get(obj.key);
              files.push({ name: obj.key.split('/').pop(), type: 'txt', content: await content.text(), url: `https://appcenter-studio-foto.r2.dev/${obj.key}` });
            } else {
              files.push({ name: obj.key.split('/').pop(), type: 'image', url: `https://appcenter-studio-foto.r2.dev/${obj.key}` });
            }
          }
        }
        await env.DB.prepare("UPDATE selezioni_album SET stato='scaricata', data_scaricamento=?, data_eliminazione=? WHERE id=?").bind(new Date().toISOString(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), d.selezione_id).run();
        return new Response(JSON.stringify({ success: true, files, cliente_nome: selezione.cliente_nome }), { headers: corsHeaders });
      }

      // ============================================
      // ROTTA INDIPENDENTE: STRUMENTO RICEVUTE D'EMERGENZA
      // ============================================
      if (path === "/api/get-active-theme" && request.method === "GET") {
        const configurazione = await env.DB.prepare("SELECT * FROM temi_colori ORDER BY id DESC LIMIT 1").first();
        if (configurazione) return new Response(JSON.stringify(configurazione), { headers: corsHeaders });
        return new Response(JSON.stringify({ active: false }), { headers: corsHeaders });
      }

      if (path === "/api/ricevute" && request.method === "POST") {
        const d = await request.json();
        const idRecord = 'ric-' + Date.now();
        await env.DB.prepare(`INSERT INTO ricevute (id, numero, data, cliente, importo, causale, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(idRecord, parseInt(d.numero || 0), d.data, d.cliente, parseFloat(d.importo || 0), d.causale, new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true, id: idRecord }), { headers: corsHeaders });
      }

      // ============================================
      // ROUTE NON TROVATA
      // ============================================
      return new Response(JSON.stringify({ error: "Endpoint non trovato", path: path }), { status: 404, headers: corsHeaders });

    } catch (error) {
      console.error("Errore Worker:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};
