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
      // 4. CRM - LISTA STUDI (Admin)
      // ============================================
      if (path === "/api/admin/crm/studi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM studi ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, studi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 5. CRM - AGGIORNA STUDIO (Admin)
      // ============================================
      if (path === "/api/admin/crm/studio" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const updates = [];
        const params = [];

        if (d.nome !== undefined) { updates.push("nome=?"); params.push(d.nome); }
        if (d.email !== undefined) { updates.push("email=?"); params.push(d.email); }
        if (d.telefono !== undefined) { updates.push("telefono=?"); params.push(d.telefono); }
        if (d.piva !== undefined) { updates.push("piva=?"); params.push(d.piva); }
        if (d.stato_abbonamento !== undefined) { updates.push("stato_abbonamento=?"); params.push(d.stato_abbonamento); }
        if (d.scadenza !== undefined) { updates.push("scadenza=?"); params.push(d.scadenza); }
        if (d.attivo !== undefined) { updates.push("attivo=?"); params.push(d.attivo ? 1 : 0); }
        if (d.password !== undefined && d.password !== '') {
          const hashed = await hashPassword(d.password);
          updates.push("password=?");
          params.push('hash:' + hashed);
          updates.push("password_plain=?");
          params.push(d.password);
        }

        if (updates.length === 0) {
          return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
        }

        params.push(d.id);
        const sql = `UPDATE studi SET ${updates.join(', ')} WHERE id=?`;
        await env.DB.prepare(sql).bind(...params).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 6. CRM - ELIMINA STUDIO (Admin)
      // ============================================
      if (path === "/api/admin/crm/studio" && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare("DELETE FROM studi WHERE id=?").bind(d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 7. CRM - CREAZIONE STUDIO (Admin)
      // ============================================
      if (path === "/api/admin/crm/studio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO studi (id, password, password_plain, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva, attivo, stato_abbonamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.password, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, d.data_registrazione || new Date().toISOString().split('T')[0], d.scadenza, 1, 1, 'attivo').run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 8. CRM - LISTA CLIENTI (Admin)
      // ============================================
      if (path === "/api/admin/crm/clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM clienti ORDER BY data_registrazione DESC").all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 9. NOTIFICHE - LISTA (Admin)
      // ============================================
      if (path === "/api/admin/notifiche" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM notifiche ORDER BY data_creazione DESC LIMIT 100").all();
        const nonLette = await env.DB.prepare("SELECT COUNT(*) as count FROM notifiche WHERE letto=0").first();
        return new Response(JSON.stringify({ success: true, notifiche: result.results, nonLette: nonLette.count }), { headers: corsHeaders });
      }

      // ============================================
      // 10. NOTIFICHE - SEGNALA LETTA
      // ============================================
      if (path === "/api/admin/notifica/letta" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const { id } = await request.json();
        await env.DB.prepare("UPDATE notifiche SET letto=1 WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 11. NOTIFICHE - SEGNALA TUTTE LETTE
      // ============================================
      if (path === "/api/admin/notifiche/lette" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        await env.DB.prepare("UPDATE notifiche SET letto=1").run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 11.5 NOTIFICHE - ELIMINA NOTIFICA (Admin)
      // ============================================
      if (path.startsWith("/api/admin/notifica/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'admin') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const id = path.split("/api/admin/notifica/")[1];
        await env.DB.prepare("DELETE FROM notifiche WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 12. REGISTRAZIONE PUBBLICA STUDIO (da sito)
      // ============================================
      if (path === "/api/public/registra-studio" && request.method === "POST") {
        const d = await request.json();
        const hashed = await hashPassword(d.password);
        const studioId = 'studio-' + Date.now();
        
        await env.DB.prepare(`INSERT INTO studi (id, password, password_plain, nome, piva, email, telefono, indirizzo, citta, stato, data_registrazione, scadenza, licenza_attiva, attivo, stato_abbonamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(studioId, 'hash:' + hashed, d.password, d.nome, d.piva, d.email, d.telefono, d.indirizzo, d.citta, d.stato, new Date().toISOString().split('T')[0], d.scadenza, 0, 1, 'trial').run();
        
        await creaNotifica('registrazione', 'Nuova Richiesta di Registrazione', `Studio "${d.nome}" ha richiesto la prova. Email: ${d.email}`, { ...d, studioId });
        return new Response(JSON.stringify({ success: true, studioId }), { headers: corsHeaders });
      }

      // ============================================
      // 13. DASHBOARD CLIENTE
      // ============================================
      if (path === "/api/cliente/dashboard" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const result = await env.DB.prepare("SELECT * FROM clienti WHERE id=?").bind(sess.user_id).first();
        return new Response(JSON.stringify({ success: true, cliente: result }), { headers: corsHeaders });
      }

      // ============================================
      // 14. LISTINI SERVIZI - LISTA (Studio)
      // ============================================
      if (path === "/api/studio/servizi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM servizi WHERE studio_id=? ORDER BY categoria, descrizione").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, servizi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 15. LISTINI SERVIZI - CREA (Studio)
      // ============================================
      if (path === "/api/studio/servizio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO servizi (id, studio_id, categoria, descrizione, prezzo, data_creazione) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.categoria, d.descrizione, d.prezzo, d.data_creazione || new Date().toISOString()).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 16. LISTINI SERVIZI - AGGIORNA (Studio)
      // ============================================
      if (path.startsWith("/api/studio/servizio/") && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const id = path.split("/api/studio/servizio/")[1];
        const d = await request.json();
        await env.DB.prepare(`UPDATE servizi SET categoria=?, descrizione=?, prezzo=? WHERE id=?`).bind(d.categoria, d.descrizione, d.prezzo, id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 17. LISTINI SERVIZI - ELIMINA (Studio)
      // ============================================
      if (path.startsWith("/api/studio/servizio/") && request.method === "DELETE") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const id = path.split("/api/studio/servizio/")[1];
        await env.DB.prepare("DELETE FROM servizi WHERE id=?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 18. PREVENTIVI - LISTA (Studio)
      // ============================================
      if (path === "/api/studio/preventivi" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM preventivi WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, preventivi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 19. PREVENTIVI - CREA/AGGIORNA (Studio)
      // ============================================
      if (path === "/api/studio/preventivo" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        
        const clienteA = JSON.stringify(d.cliente_a || {});
        const clienteB = JSON.stringify(d.cliente_b || {});
        const servizi = JSON.stringify(d.servizi || []);
        
        await env.DB.prepare(`INSERT INTO preventivi (id, studio_id, numero, data_emissione, data_servizio, tipo_servizio, cliente_a, cliente_b, servizi, sconto_perc, sconto_fisso, sconto_fisso_nota, accettato, note, totale_finale, stato, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          d.id, d.studio_id, d.numero, d.data_emissione, d.data_servizio || null, d.tipo_servizio || null,
          clienteA, clienteB, servizi,
          d.sconto_perc || 0, d.sconto_fisso || 0, d.sconto_fisso_nota || null,
          d.accettato ? 1 : 0, d.note || null, d.totale_finale || 0, d.stato || 'bozza',
          d.data_creazione || new Date().toISOString()
        ).run();
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 20. NOTIFICA ACCETTAZIONE PREVENTIVO (Studio -> Admin CRM)
      // ============================================
      if (path === "/api/studio/notifica-accettazione" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const studio = await env.DB.prepare("SELECT nome FROM studi WHERE id=?").bind(sess.user_id).first();
        const nomeStudio = studio ? studio.nome : sess.user_id;
        
        await creaNotifica(
          'preventivo_accettato',
          'Preventivo Accettato dal Cliente',
          `Lo studio "${nomeStudio}" ha registrato l'accettazione di un preventivo. ${d.messaggio || ''}`,
          { studio_id: sess.user_id, studio_nome: nomeStudio, ...d }
        );
        
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 21. CLIENTE - LISTA CARTELLE FOTO
      // ============================================
      if (path === "/api/cliente/foto/cartelle" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const cliente = await env.DB.prepare("SELECT studio_id FROM clienti WHERE id=?").bind(clienteId).first();
        const studioId = cliente.studio_id;
        const bucket = env.appcenter_studio_foto;
        if (!bucket) return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });

        const prefix = `gallerie/${studioId}/${clienteId}/`;
        const objects = await bucket.list({ prefix });
        
        const cartelleSet = new Set();
        for (const object of objects.objects) {
            const key = object.key;
            const parts = key.replace(prefix, '').split('/');
            if (parts.length > 1 && parts[0] !== "") {
                cartelleSet.add(parts[0]);
            }
        }
        
        return new Response(JSON.stringify({ success: true, cartelle: Array.from(cartelleSet) }), { headers: corsHeaders });
      }

      // ============================================
      // 22. CLIENTE - ELENCO FOTO IN CARTELLA
      // ============================================
      if (path === "/api/cliente/foto/elenco" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const cartella = url.searchParams.get("cartella");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const cliente = await env.DB.prepare("SELECT studio_id FROM clienti WHERE id=?").bind(clienteId).first();
        const studioId = cliente.studio_id;
        const bucket = env.appcenter_studio_foto;

        const prefix = `gallerie/${studioId}/${clienteId}/${cartella}/`;
        const objects = await bucket.list({ prefix });
        
        const foto = objects.objects.map(obj => ({
            name: obj.key.split('/').pop(),
            url: `https://appcenter-studio-foto.r2.dev/${obj.key}`
        }));

        return new Response(JSON.stringify({ success: true, foto }), { headers: corsHeaders });
      }

      // ============================================
      // 23. CLIENTE - INVIO SELEZIONE FOTO
      // ============================================
      if (path === "/api/cliente/selezione/invia" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const clienteId = url.searchParams.get("clienteId");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'cliente' || sess.user_id !== clienteId) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const { selezionate } = await request.json();
        const cliente = await env.DB.prepare("SELECT studio_id, nome_a, cognome_a FROM clienti WHERE id=?").bind(clienteId).first();
        const studioId = cliente.studio_id;
        const bucket = env.appcenter_studio_foto;

        const prefix = `gallerie/${studioId}/${clienteId}/`;
        const allObjects = await bucket.list({ prefix });
        
        let fileTestoContenuto = "FOTO SELEZIONATE DAL CLIENTE\n";
        fileTestoContenuto += `Cliente: ${cliente.nome_a} ${cliente.cognome_a}\n`;
        fileTestoContenuto += `Data: ${new Date().toLocaleString('it-IT')}\n`;
        fileTestoContenuto += "----------------------------------------\n";

        for (const obj of allObjects.objects) {
            const filename = obj.key.split('/').pop();
            if (filename.endsWith('.txt')) continue;

            if (selezionate.includes(filename)) {
                fileTestoContenuto += `${filename}\n`;
            } else {
                await bucket.delete(obj.key);
            }
        }

        const txtKey = `${prefix}SELEZIONE_${Date.now()}.txt`;
        await bucket.put(txtKey, fileTestoContenuto);

        const idNotifica = 'not-' + Date.now();
        await env.DB.prepare(
            "INSERT INTO notifiche (id, tipo, titolo, messaggio, dati, letto, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).bind(
            idNotifica, 
            'selezione_foto', 
            'Nuova Selezione Foto Completata', 
            `Il cliente ${cliente.nome_a} ${cliente.cognome_a} ha completato la selezione. File elenco generato nel cloud.`, 
            JSON.stringify({ clienteId, studioId, file_txt: txtKey }), 
            0, 
            new Date().toISOString()
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 24. RICEVUTE (Studio)
      // ============================================
      if (path === "/api/studio/ricevute" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM ricevute WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, ricevute: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/ricevuta" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO ricevute (id, studio_id, cliente_nome, servizio, importo, data, tipologia, metodo, note, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente_nome, d.servizio, d.importo, d.data, d.tipologia, d.metodo, d.note, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 25. WORKFLOW (Studio)
      // ============================================
      if (path === "/api/studio/workflow" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM workflow WHERE studio_id=? ORDER BY data_creazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, workflow: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO workflow (id, studio_id, cliente, data_evento, tipo_servizio, scadenza, stato_foto, stato_video, note, data_creazione, ultimo_aggiornamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.cliente, d.data_evento, d.tipo_servizio, d.scadenza, d.stato_foto, d.stato_video, d.note, d.data_creazione, d.ultimo_aggiornamento).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/workflow" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`UPDATE workflow SET stato_foto=?, stato_video=?, note=?, ultimo_aggiornamento=? WHERE id=?`).bind(d.stato_foto, d.stato_video, d.note, d.ultimo_aggiornamento, d.id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 26. AGENDA (Studio)
      // ============================================
      if (path === "/api/studio/agenda" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM agenda WHERE studio_id=? ORDER BY data DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, eventi: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/agenda" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO agenda (id, studio_id, titolo, data, tipo, note, creato_il) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.titolo, d.data, d.tipo, d.note, d.creato_il).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 27. CLIENTI (Studio)
      // ============================================
      if (path === "/api/studio/clienti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM clienti WHERE studio_id=? ORDER BY data_registrazione DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, clienti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/cliente" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const hashed = await hashPassword(d.password);
        await env.DB.prepare(`INSERT INTO clienti (id, password, password_plain, studio_id, nome_a, cognome_a, nome_b, cognome_b, email, telefono, tipo_evento, data_evento, data_registrazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, 'hash:' + hashed, d.password, d.studio_id, d.nome_a, d.cognome_a, d.nome_b, d.cognome_b, d.email, d.telefono, d.tipo_evento, d.data_evento, d.data_registrazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 28. EMAIL ARCHIVIO (Studio)
      // ============================================
      if (path === "/api/studio/email-archivio" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM email_archivio WHERE studio_id=? ORDER BY data_invio DESC").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, archivio: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/email-archivio" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO email_archivio (id, studio_id, destinatario, oggetto, corpo, data_invio) VALUES (?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.destinatario, d.oggetto, d.corpo, d.data_invio).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 29. NEGOZIO (Studio)
      // ============================================
      if (path === "/api/studio/negozio/prodotti" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM prodotti_negozio WHERE studio_id=?").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, prodotti: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio/prodotto" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO prodotti_negozio (id, studio_id, nome, categoria, prezzo, misura, descrizione, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nome, d.categoria, d.prezzo, d.misura, d.descrizione, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM negozi_config WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, config: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/negozio-config" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM negozi_config WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE negozi_config SET paypal_email=?, whatsapp_numero=?, studio_indirizzo=? WHERE studio_id=?`).bind(d.paypal_email, d.whatsapp_numero, d.studio_indirizzo, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO negozi_config (studio_id, paypal_email, whatsapp_numero, studio_indirizzo) VALUES (?, ?, ?, ?)`).bind(d.studio_id, d.paypal_email, d.whatsapp_numero, d.studio_indirizzo).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 30. LISTA REGALI (Studio)
      // ============================================
      if (path === "/api/studio/lista-regali" && request.method === "GET") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE studio_id=?").bind(studioId).all();
        return new Response(JSON.stringify({ success: true, lista: result.results }), { headers: corsHeaders });
      }

      if (path === "/api/studio/lista-regali" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        await env.DB.prepare(`INSERT INTO lista_regali (id, studio_id, nomi, evento, costo_totale, link_pagamento, whatsapp_clienti, raccolto_attuale, data_creazione) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(d.id, d.studio_id, d.nomi, d.evento, d.costo_totale, d.link_pagamento, d.whatsapp_clienti, d.raccolto_attuale, d.data_creazione).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 31. LISTA REGALI PUBBLICA
      // ============================================
      if (path === "/api/public/lista-regali" && request.method === "GET") {
        const listaId = url.searchParams.get("id");
        const result = await env.DB.prepare("SELECT * FROM lista_regali WHERE id=?").bind(listaId).first();
        return new Response(JSON.stringify({ success: true, lista: result }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali/messaggio" && request.method === "POST") {
        const d = await request.json();
        await env.DB.prepare(`INSERT INTO messaggi_regali (lista_id, nome_donatore, messaggio, importo, data) VALUES (?, ?, ?, ?, ?)`).bind(d.lista_id, d.nome_donatore, d.messaggio, d.importo || 0, d.data).run();
        
        const lista = await env.DB.prepare("SELECT * FROM lista_regali WHERE id=?").bind(d.lista_id).first();
        if (lista) {
          const nuovoRaccolto = (parseFloat(lista.raccolto_attuale || 0) + parseFloat(d.importo || 0));
          await env.DB.prepare("UPDATE lista_regali SET raccolto_attuale=? WHERE id=?").bind(nuovoRaccolto, d.lista_id).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path === "/api/public/lista-regali/messaggi" && request.method === "GET") {
        const listaId = url.searchParams.get("listaId");
        const result = await env.DB.prepare("SELECT * FROM messaggi_regali WHERE lista_id=? ORDER BY data DESC").bind(listaId).all();
        return new Response(JSON.stringify({ success: true, messaggi: result.results }), { headers: corsHeaders });
      }

      // ============================================
      // 32. UPLOAD FOTO R2 (Studio)
      // ============================================
      if (path === "/api/studio/upload" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const studioId = url.searchParams.get("studioId");
        const clienteId = url.searchParams.get("clienteId");
        const folder = url.searchParams.get("folder") || "galleria";
        const filename = url.searchParams.get("filename") || "foto.jpg";
        const body = await request.arrayBuffer();
        const bucket = env.appcenter_studio_foto;
        if (bucket) {
          await bucket.put(`gallerie/${studioId}/${clienteId}/${folder}/${Date.now()}_${filename}`, body);
          return new Response(JSON.stringify({ success: true, url: `https://appcenter-studio-foto.r2.dev/gallerie/${studioId}/${clienteId}/${folder}/${filename}` }), { headers: corsHeaders });
        }
        return new Response(JSON.stringify({ error: "Bucket non configurato" }), { status: 500, headers: corsHeaders });
      }

      // ============================================
      // 33. TEMI (Studio)
      // ============================================
      if (path === "/api/studio/tema" && request.method === "GET") {
        const studioId = url.searchParams.get("studioId");
        const result = await env.DB.prepare("SELECT * FROM temi_colori WHERE studio_id=?").bind(studioId).first();
        return new Response(JSON.stringify({ success: true, tema: result }), { headers: corsHeaders });
      }

      if (path === "/api/studio/tema" && request.method === "POST") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const existing = await env.DB.prepare("SELECT id FROM temi_colori WHERE studio_id=?").bind(d.studio_id).first();
        if (existing) {
          await env.DB.prepare(`UPDATE temi_colori SET tema_attivo=? WHERE studio_id=?`).bind(d.tema_attivo, d.studio_id).run();
        } else {
          await env.DB.prepare(`INSERT INTO temi_colori (studio_id, tema_attivo) VALUES (?, ?)`).bind(d.studio_id, d.tema_attivo).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // ============================================
      // 34. PROFILO STUDIO (con notifica all'admin)
      // ============================================
      if (path === "/api/studio/profilo" && request.method === "PUT") {
        const token = url.searchParams.get("token");
        const sess = await verificaSessione(token);
        if (!sess || sess.tipo !== 'studio') return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 403, headers: corsHeaders });

        const d = await request.json();
        const updates = [];
        const params = [];

        if (d.nome !== undefined) { updates.push("nome=?"); params.push(d.nome); }
        if (d.piva !== undefined) { updates.push("piva=?"); params.push(d.piva); }
        if (d.email !== undefined) { updates.push("email=?"); params.push(d.email); }
        if (d.telefono !== undefined) { updates.push("telefono=?"); params.push(d.telefono); }
        if (d.indirizzo !== undefined) { updates.push("indirizzo=?"); params.push(d.indirizzo); }
        if (d.citta !== undefined) { updates.push("citta=?"); params.push(d.citta); }
        if (d.stato !== undefined) { updates.push("stato=?"); params.push(d.stato); }

        if (updates.length > 0) {
          params.push(sess.user_id);
          const sql = `UPDATE studi SET ${updates.join(', ')} WHERE id=?`;
          await env.DB.prepare(sql).bind(...params).run();
          
          await creaNotifica('scheda_compilata', 'Scheda Anagrafica Compilata', `Lo studio "${d.nome || sess.user_id}" ha compilato/aggiornato la sua scheda anagrafica.`, d);
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
