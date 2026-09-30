require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const { spawn } = require('child_process');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app  = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/api', (req, res) => { res.json({ status: 'JanConnect API running', version: '1.0' }); });

// ─── POST /api/send-confirmation ─────────────────────────────────────────────
app.post('/api/send-confirmation', async (req, res) => {
  try {
    const { to, citizenName, complaintId, department, location, status } = req.body;
    if (!to || !complaintId) return res.status(400).json({ error: 'Missing required fields' });
    const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(110deg,#0d2546,#193e6c);color:white;padding:28px;text-align:center;"><div style="font-size:28px;font-weight:900;">JC</div><div style="font-size:20px;font-weight:700;margin-top:6px;">JanConnect</div><div style="font-size:12px;color:#c8d7e9;margin-top:4px;">Digital Public Good &bull; Bharat Setu Initiative</div></div><div style="padding:28px;"><div style="display:inline-block;background:#dff6ec;color:#087653;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px;">&#10003; COMPLAINT RECEIVED</div><p style="font-size:15px;color:#172b45;">Dear <strong>${citizenName || 'Citizen'}</strong>,</p><p style="color:#64748b;font-size:14px;">Your complaint has been submitted to JanConnect.</p><table style="width:100%;border-collapse:collapse;margin:20px 0;"><tr style="background:#f5f8fc;"><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;width:35%;">COMPLAINT ID</td><td style="padding:12px 16px;font-size:13px;font-weight:700;color:#172b45;">${complaintId}</td></tr><tr><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;border-top:1px solid #e8edf3;">DEPARTMENT</td><td style="padding:12px 16px;font-size:13px;color:#172b45;border-top:1px solid #e8edf3;">${department || 'Under review'}</td></tr><tr style="background:#f5f8fc;"><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;">LOCATION</td><td style="padding:12px 16px;font-size:13px;color:#172b45;">${location || 'Not specified'}</td></tr><tr><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;border-top:1px solid #e8edf3;">STATUS</td><td style="padding:12px 16px;border-top:1px solid #e8edf3;"><span style="background:#fff3d7;color:#a35b00;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:800;">${status || 'UNDER REVIEW'}</span></td></tr></table></div><div style="background:#f5f8fc;text-align:center;padding:16px;font-size:11px;color:#8491a2;">&copy; ${new Date().getFullYear()} JanConnect</div></div>`;
    await transporter.sendMail({ from: '"JanConnect" <' + process.env.EMAIL_USER + '>', to, subject: 'Complaint Received - JanConnect [' + complaintId + ']', html });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/send-resolved ──────────────────────────────────────────────────
app.post('/api/send-resolved', async (req, res) => {
  try {
    const { to, citizenName, complaintId, department, resolvedBy, resolvedAt } = req.body;
    if (!to || !complaintId) return res.status(400).json({ error: 'Missing required fields' });
    const html = `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;"><div style="background:linear-gradient(110deg,#0d2546,#193e6c);color:white;padding:28px;text-align:center;"><div style="font-size:28px;font-weight:900;">JC</div><div style="font-size:20px;font-weight:700;margin-top:6px;">JanConnect</div></div><div style="padding:28px;"><div style="display:inline-block;background:#dff6ec;color:#087653;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px;">COMPLAINT RESOLVED</div><p style="font-size:15px;color:#172b45;">Dear <strong>${citizenName || 'Citizen'}</strong>,</p><p style="color:#64748b;font-size:14px;">Your complaint has been resolved.</p><table style="width:100%;border-collapse:collapse;margin:20px 0;"><tr style="background:#f5f8fc;"><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;width:35%;">COMPLAINT ID</td><td style="padding:12px 16px;font-size:13px;font-weight:700;color:#172b45;">${complaintId}</td></tr><tr><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;border-top:1px solid #e8edf3;">RESOLVED BY</td><td style="padding:12px 16px;font-size:13px;color:#172b45;border-top:1px solid #e8edf3;">${resolvedBy || 'Department Official'}</td></tr><tr style="background:#f5f8fc;"><td style="padding:12px 16px;font-size:12px;font-weight:700;color:#8491a2;">STATUS</td><td style="padding:12px 16px;"><span style="background:#dff6ec;color:#087653;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:800;">RESOLVED</span></td></tr></table></div><div style="background:#f5f8fc;text-align:center;padding:16px;font-size:11px;color:#8491a2;">&copy; ${new Date().getFullYear()} JanConnect</div></div>`;
    await transporter.sendMail({ from: '"JanConnect" <' + process.env.EMAIL_USER + '>', to, subject: 'Complaint Resolved - JanConnect [' + complaintId + ']', html });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── POST /api/group-complaints (Gemini 1.5 Flash) ───────────────────────────
// ─── POST /api/group-complaints (Local Qwen2.5 / Gemini / Clustering Fallback) ──
app.post('/api/group-complaints', async (req, res) => {
  try {
    const { complaints, department } = req.body;
    if (!complaints?.length) return res.status(400).json({ error: 'Valid complaints array required' });

    // 1. Try Local Qwen2.5 model
    if (llamaReady) {
      try {
        const miniList = complaints.map(c => ({
          id: c.id,
          title: c.title,
          location: c.location || '',
          dept: c.department || department || ''
        }));

        const prompt =
          `You are an AI assistant for the ${department || 'Government'} Department in India.\n` +
          `Analyze these complaints and group similar ones by issue type and location.\n` +
          `Complaints:\n` + JSON.stringify(miniList) + `\n\n` +
          `Return ONLY a raw JSON array of objects with keys: groupTitle, priority ("HIGH"|"MEDIUM"|"LOW"), area, complaintIds (array of string ids), reason.\n` +
          `Output ONLY the JSON array starting with [ and ending with ].`;

        const r = await fetch(`http://127.0.0.1:${LLAMA_LOCAL_PORT}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are an AI assistant for a government department in India. Return ONLY a valid JSON array with keys: groupTitle, priority, area, complaintIds, reason.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 600,
            temperature: 0.1,
            stream: false
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (r.ok) {
          const data = await r.json();
          let raw = (data.choices?.[0]?.message?.content || '').trim();
          raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
          const start = raw.indexOf('[');
          const end = raw.lastIndexOf(']');
          if (start !== -1 && end !== -1 && end > start) {
            const parsed = JSON.parse(raw.slice(start, end + 1));
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`[Qwen2.5 Grouping] Grouped ${complaints.length} complaints into ${parsed.length} clusters`);
              return res.json({ groups: parsed, source: 'qwen2.5-local' });
            }
          }
        }
      } catch (err) {
        console.warn('[Qwen Grouping] warning:', err.message);
      }
    }

    // 2. Try Gemini 1.5 Flash (if key available)
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = ['You are an AI assistant for a government department (' + (department || 'General') + ') in India.','Group complaints by same root cause AND location cluster. Unique complaints = their own group.','','Complaints:', JSON.stringify(complaints, null, 2),'','Return ONLY raw JSON array:','[{"groupTitle":"...","priority":"HIGH|MEDIUM|LOW","area":"...","complaintIds":["id1"],"reason":"..."}]'].join('\n');
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/,'').trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return res.json({ groups: parsed, source: 'gemini' });
      } catch (err) {
        console.warn('[Gemini Grouping] warning:', err.message);
      }
    }

    // 3. Smart Rule-Based Clustering Fallback (Never Fails)
    const clusters = {};
    for (const c of complaints) {
      const loc = (c.location || 'General Area').split(',')[0].trim() || 'General Area';
      const key = loc;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(c);
    }

    const groups = Object.entries(clusters).map(([area, items]) => {
      const ids = items.map(i => i.id);
      const isUrgent = items.some(i => (i.title + ' ' + (i.description || '')).toLowerCase().match(/urgent|danger|accident|leak|hospital|collapsed|flood/));
      return {
        groupTitle: `${department || 'Civic'} Issues Cluster (${area})`,
        priority: isUrgent ? 'HIGH' : (items.length > 1 ? 'MEDIUM' : 'LOW'),
        area: area,
        complaintIds: ids,
        reason: `${items.length} complaint(s) reported in ${area} requiring coordinated resolution.`
      };
    });

    console.log(`[Clustering Fallback] Grouped into ${groups.length} area clusters`);
    return res.json({ groups, source: 'cluster-engine' });

  } catch (err) {
    console.error('group-complaints fatal error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/suggest-department
// Model Priority:
//   1. Local Model File: models/qwen2.5-1.5b-instruct-q4_k_m.gguf via bin/llama-server.exe
//   2. Local Ollama: http://localhost:11434 (if installed)
//   3. HuggingFace Inference API: Qwen/Qwen2.5-1.5B-Instruct (if HF_TOKEN is set)
//   4. Keyword fallback (always works)
// ─────────────────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  'Municipal Corporation',
  'Water Department',
  'Electricity Department',
  'Roads Department',
  'Public Works Department',
  'Health Department',
  'Sanitation Department',
  'Traffic Police',
  'District Administration',
  'Urban Development Department',
  'Rural Development Department',
  'Education Department'
];

const SYSTEM_PROMPT =
  'You are a government complaint routing assistant for India. ' +
  'Given a citizen complaint, select 1 to 3 relevant departments from this list that should take action:\n' +
  DEPARTMENTS.join('\n') +
  '\nOutput up to 3 department names separated by commas (e.g. Roads Department, Traffic Police). Only output exact names from the list.';

function keywordMatch(text) {
  const t = text.toLowerCase();
  const map = {
    'Roads Department':             ['road','pothole','footpath','highway','street','pavement','tar','bridge','divider','flyover','speed breaker'],
    'Water Department':             ['water','pipeline','tap','supply','leakage','drinking','borewell','pipe burst','no water'],
    'Electricity Department':       ['light','electricity','power','streetlight','transformer','wire','electric','outage','blackout','voltage','meter'],
    'Sanitation Department':        ['garbage','waste','trash','dustbin','cleanliness','litter','sewage','stench','fly','rat','open defecation'],
    'Municipal Corporation':        ['municipal','corporation','ward','civic','drainage','flood','waterlogging','demolit','encroach'],
    'Health Department':            ['hospital','health','clinic','medicine','doctor','ambulance','disease','dengue','malaria','epidemic','vaccination'],
    'Traffic Police':               ['traffic','signal','parking','accident','speed','police','jam','rash driving','no helmet'],
    'Education Department':         ['school','college','teacher','student','education','classroom','midday meal','scholarship','textbook'],
    'Public Works Department':      ['building','public work','construction','infrastructure','government office','boundary wall'],
    'Rural Development Department': ['village','rural','panchayat','gram','crop','farmer','kisan','well','irrigation'],
    'Urban Development Department': ['urban','planning','layout','zone','slum','master plan','regularize'],
    'District Administration':      ['district','collector','tehsil','administration','certificate','ration','affidavit','fir']
  };
  const scores = [];
  for (const [dept, kws] of Object.entries(map)) {
    const score = kws.filter(k => t.includes(k)).length;
    if (score > 0) scores.push({ dept, score });
  }
  scores.sort((a, b) => b.score - a.score);
  const matched = scores.slice(0, 3).map(s => s.dept);
  return {
    departments: matched,
    department: matched[0] || null,
    source: 'keyword'
  };
}

function extractDepartments(raw) {
  if (!raw) return [];
  const parts = raw.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
  const found = [];
  for (const part of parts) {
    const match = DEPARTMENTS.find(d => d.toLowerCase() === part.toLowerCase())
               || DEPARTMENTS.find(d => part.toLowerCase().includes(d.toLowerCase()))
               || DEPARTMENTS.find(d => d.toLowerCase().includes(part.toLowerCase()));
    if (match && !found.includes(match)) {
      found.push(match);
    }
  }
  if (found.length === 0) {
    for (const d of DEPARTMENTS) {
      if (raw.toLowerCase().includes(d.toLowerCase()) && !found.includes(d)) {
        found.push(d);
      }
    }
  }
  return found.slice(0, 3);
}

// ── Local Embedded GGUF Server setup ──────────────────────────────────────────
const LOCAL_MODEL_PATH = path.join(__dirname, 'models', 'qwen2.5-1.5b-instruct-q4_k_m.gguf');
const LLAMA_SERVER_EXE = path.join(__dirname, 'bin', 'llama-server.exe');
const LLAMA_LOCAL_PORT = 8088;
let llamaProcess = null;
let llamaReady = false;

function startLocalLlamaServer() {
  if (llamaProcess || !fs.existsSync(LOCAL_MODEL_PATH) || !fs.existsSync(LLAMA_SERVER_EXE)) {
    return;
  }
  console.log('  🚀 Launching local Qwen2.5-1.5B model from file: models/qwen2.5-1.5b-instruct-q4_k_m.gguf ...');
  try {
    llamaProcess = spawn(LLAMA_SERVER_EXE, [
      '-m', LOCAL_MODEL_PATH,
      '--port', LLAMA_LOCAL_PORT.toString(),
      '--host', '127.0.0.1',
      '-c', '1024',
      '-n', '32',
      '--log-disable'
    ], {
      stdio: 'ignore'
    });

    llamaProcess.on('error', (err) => {
      console.warn('  ⚠️ Local Qwen process error:', err.message);
      llamaProcess = null;
      llamaReady = false;
    });

    llamaProcess.on('exit', (code) => {
      console.log('  ℹ️  Local Qwen process exited (code ' + code + ')');
      llamaProcess = null;
      llamaReady = false;
    });

    // Check health periodically until ready
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`http://127.0.0.1:${LLAMA_LOCAL_PORT}/health`);
        if (res.ok) {
          llamaReady = true;
          clearInterval(interval);
          console.log('  ✅ Local Qwen2.5-1.5B model is ONLINE and ready for inference!');
        }
      } catch (e) {
        if (attempts > 30) clearInterval(interval);
      }
    }, 1000);
  } catch (e) {
    console.warn('  ⚠️ Failed to spawn local llama-server:', e.message);
  }
}

// Clean up child process on exit
process.on('exit', () => { if (llamaProcess) llamaProcess.kill(); });
process.on('SIGINT', () => { if (llamaProcess) llamaProcess.kill(); process.exit(); });
process.on('SIGTERM', () => { if (llamaProcess) llamaProcess.kill(); process.exit(); });

const OLLAMA_URL  = process.env.OLLAMA_URL || 'http://localhost:11434';
const HF_TOKEN    = process.env.HF_TOKEN;
const HF_MODEL    = 'Qwen/Qwen2.5-1.5B-Instruct';
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`;

app.post('/api/suggest-department', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 10) return res.json({ department: null });

    const userText = text.slice(0, 350);

    // ── 1. Local GGUF Model File (bin/llama-server.exe) ───────────────────────
    if (!llamaReady && fs.existsSync(LOCAL_MODEL_PATH) && fs.existsSync(LLAMA_SERVER_EXE)) {
      startLocalLlamaServer();
    }
    if (llamaReady) {
      try {
        const r = await fetch(`http://127.0.0.1:${LLAMA_LOCAL_PORT}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Complaint: "${userText}"` }
            ],
            max_tokens: 35,
            temperature: 0.0,
            stream: false
          }),
          signal: AbortSignal.timeout(8000)
        });
        if (r.ok) {
          const data = await r.json();
          const raw = (data.choices?.[0]?.message?.content || '').trim();
          const depts = extractDepartments(raw);
          console.log(`[Qwen2.5 Local File] "${raw}" → ${depts.join(', ') || 'none'}`);
          if (depts.length > 0) return res.json({ departments: depts, department: depts[0], source: 'qwen2.5-1.5b-local-file' });
        }
      } catch (e) {
        console.warn('[Qwen2.5 Local File] error:', e.message);
      }
    }

    // ── 2. Ollama (if running) ────────────────────────────────────────────────
    try {
      const r = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:1.5b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Complaint: "${userText}"` }
          ],
          max_tokens: 35,
          temperature: 0.0,
          stream: false
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (r.ok) {
        const data = await r.json();
        const raw = (data.choices?.[0]?.message?.content || '').trim();
        const depts = extractDepartments(raw);
        if (depts.length > 0) return res.json({ departments: depts, department: depts[0], source: 'qwen2.5-1.5b-ollama' });
      }
    } catch (e) {}

    // ── 3. HuggingFace Cloud API (if configured) ──────────────────────────────
    if (HF_TOKEN) {
      try {
        const r = await fetch(HF_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: HF_MODEL,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: `Complaint: "${userText}"` }
            ],
            max_tokens: 35,
            temperature: 0.0,
            stream: false
          }),
          signal: AbortSignal.timeout(10000)
        });
        if (r.ok) {
          const data = await r.json();
          const raw = (data.choices?.[0]?.message?.content || '').trim();
          const depts = extractDepartments(raw);
          if (depts.length > 0) return res.json({ departments: depts, department: depts[0], source: 'qwen2.5-1.5b-hf' });
        }
      } catch (e) {}
    }

    // ── 4. Keyword Fallback ───────────────────────────────────────────────────
    return res.json(keywordMatch(text));

  } catch (err) {
    console.error('suggest-department error:', err.message);
    res.json({ department: null, source: 'error' });
  }
});

// ─── Status endpoint — shows which AI backend is active ──────────────────────
app.get('/api/ai-status', async (req, res) => {
  const modelFileExists = fs.existsSync(LOCAL_MODEL_PATH);
  let modelFileSizeMB = 0;
  if (modelFileExists) {
    try { modelFileSizeMB = Math.round(fs.statSync(LOCAL_MODEL_PATH).size / 1024 / 1024); } catch (e) {}
  }

  const status = {
    localFile: {
      modelFileExists,
      modelFileSizeMB,
      llamaServerExeExists: fs.existsSync(LLAMA_SERVER_EXE),
      llamaReady
    },
    activeModel: llamaReady ? 'qwen2.5-1.5b-local-file' : (HF_TOKEN ? 'qwen2.5-1.5b-hf' : 'keyword')
  };
  res.json(status);
});

app.listen(port, () => {
  console.log('');
  console.log('  JanConnect is running!');
  console.log('  Open: http://localhost:' + port);
  console.log('');

  // Start local Qwen if model file exists
  if (fs.existsSync(LOCAL_MODEL_PATH) && fs.existsSync(LLAMA_SERVER_EXE)) {
    startLocalLlamaServer();
  } else {
    console.log('  ℹ️  Local model file not detected yet. Keyword fallback active.');
    // Check periodically for when download completes
    const checkFile = setInterval(() => {
      if (fs.existsSync(LOCAL_MODEL_PATH) && fs.existsSync(LLAMA_SERVER_EXE)) {
        clearInterval(checkFile);
        startLocalLlamaServer();
      }
    }, 3000);
  }
});
