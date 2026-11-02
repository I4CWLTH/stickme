const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }) : null;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', async (_req, res) => {
  let db = 'not-configured';
  if (pool) {
    try { await pool.query('select 1'); db = 'connected'; }
    catch (e) { db = 'error'; }
  }
  res.json({ ok: true, service: 'stickme', database: db, engine: 'production-frame-v1' });
});

app.get('/api/motions', async (_req, res) => {
  if (!pool) return res.json({ motions: [] });
  try {
    const { rows } = await pool.query('select slug, name, category, fps, duration_ms, loop from motion_clips where active = true order by category, name');
    res.json({ motions: rows });
  } catch (e) { res.status(500).json({ error: 'motion_library_unavailable' }); }
});

app.post('/api/projects', async (req, res) => {
  const { title = 'Untitled Stickme Movie', script = '', format = '16:9' } = req.body || {};
  if (!pool) return res.status(503).json({ error: 'database_not_configured' });
  try {
    const { rows } = await pool.query(
      'insert into projects(title, script, format) values($1,$2,$3) returning id,title,script,format,status,created_at',
      [title, script, format]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'project_create_failed' }); }
});

app.put('/api/projects/:id/scenes', async (req, res) => {
  const { scenes = [] } = req.body || {};
  if (!pool) return res.status(503).json({ error: 'database_not_configured' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('delete from scenes where project_id = $1', [req.params.id]);
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      await client.query(
        'insert into scenes(project_id, scene_index, title, duration_ms, beats_json) values($1,$2,$3,$4,$5::jsonb)',
        [req.params.id, i, s.title || `Scene ${i + 1}`, Math.round((s.duration || 0) * 1000), JSON.stringify(s.dialogue || [])]
      );
    }
    await client.query('commit');
    res.json({ ok: true, sceneCount: scenes.length });
  } catch (e) {
    await client.query('rollback');
    res.status(500).json({ error: 'scene_save_failed' });
  } finally { client.release(); }
});

app.post('/api/render-jobs', async (req, res) => {
  const { projectId, quality = '1080p', watermark = true } = req.body || {};
  if (!pool) return res.status(503).json({ error: 'database_not_configured' });
  try {
    const { rows } = await pool.query(
      'insert into render_jobs(project_id, quality, watermark, status) values($1,$2,$3,$4) returning *',
      [projectId, quality, watermark, 'queued']
    );
    res.status(202).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'render_job_failed' }); }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => console.log(`Stickme listening on ${port}`));
