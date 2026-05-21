import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'emr_platform',
  PORT = '4000',
} = process.env;

const SAMPLE_USERS = [
  {
    id: 'u1',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@central-hospital.health',
    role: 'hospital',
    organizationId: 'h1',
    organizationName: 'Central General Hospital',
    regionId: 'r1',
  },
  {
    id: 'u2',
    name: 'Joko Mulyono, S.K.M',
    email: 'joko.mulyono@dinkesdiy.go.id',
    role: 'health_office',
    organizationId: 'ho-diy',
    organizationName: 'Dinas Kesehatan DIY',
    regionId: 'r-diy',
  },
  {
    id: 'u3',
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@moh.gov',
    role: 'ministry',
    organizationId: 'moh',
    organizationName: 'Ministry of Health',
  },
];

const SAMPLE_REGIONS = [
  { id: 'r1', name: 'Eastern Region', healthOfficeId: 'ho1', hospitalCount: 12 },
  { id: 'r-diy', name: 'Daerah Istimewa Yogyakarta', healthOfficeId: 'ho-diy', hospitalCount: 14 },
  { id: 'r3', name: 'Northern Region', healthOfficeId: 'ho3', hospitalCount: 15 },
];

const SAMPLE_HOSPITALS = [
  {
    id: 'h1',
    name: 'Central General Hospital',
    regionId: 'r1',
    regionName: 'Eastern Region',
    type: 'general',
    bedCount: 450,
    city: 'Capital City',
    currentEMRAMStage: 4,
    lastAssessmentDate: '2025-12-15',
  },
  {
    id: 'h2',
    name: 'University Teaching Hospital',
    regionId: 'r1',
    regionName: 'Eastern Region',
    type: 'teaching',
    bedCount: 650,
    city: 'Capital City',
    currentEMRAMStage: 5,
    lastAssessmentDate: '2025-11-20',
  },
  {
    id: 'h3',
    name: 'Northern District Hospital',
    regionId: 'r3',
    regionName: 'Northern Region',
    type: 'district',
    bedCount: 200,
    city: 'Northern City',
    currentEMRAMStage: 2,
    lastAssessmentDate: '2025-10-05',
  },
  {
    id: 'h6',
    name: 'RSUP Dr. Sardjito',
    regionId: 'r-diy',
    regionName: 'Daerah Istimewa Yogyakarta',
    type: 'teaching',
    bedCount: 950,
    city: 'Sleman',
    currentEMRAMStage: 6,
    lastAssessmentDate: '2026-02-10',
  },
  {
    id: 'h7',
    name: 'RS Bethesda Yogyakarta',
    regionId: 'r-diy',
    regionName: 'Daerah Istimewa Yogyakarta',
    type: 'general',
    bedCount: 415,
    city: 'Kota Yogyakarta',
    currentEMRAMStage: 5,
    lastAssessmentDate: '2025-12-20',
  },
];

const SAMPLE_ASSESSMENTS = [
  {
    id: 'a1',
    hospitalId: 'h1',
    hospitalName: 'Central General Hospital',
    regionId: 'r1',
    status: 'validated',
    currentStage: 4,
    targetStage: 5,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
    submittedAt: '2025-11-15T09:00:00Z',
    reviewedAt: '2025-12-01T16:00:00Z',
    validatedAt: '2025-12-15T14:30:00Z',
    answers: [],
    totalScore: 85,
    categoryScores: { cat1: 90, cat2: 85, cat3: 82, cat4: 78, cat5: 70 },
    createdBy: 'u1',
    reviewedBy: 'u2',
    validatedBy: 'u3',
    hospitalNotes: 'We have fully implemented CPOE and nursing documentation.',
    reviewerComments: 'Hospital meets Stage 4 requirements. Recommend focusing on CDS for Stage 5.',
    ministryComments: 'Validated at Stage 4. Approved for national database.',
    version: 1,
  },
  {
    id: 'a4',
    hospitalId: 'h1',
    hospitalName: 'Central General Hospital',
    regionId: 'r1',
    status: 'draft',
    currentStage: 4,
    targetStage: 5,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T16:30:00Z',
    answers: [],
    totalScore: 0,
    categoryScores: {},
    createdBy: 'u1',
    hospitalNotes: 'Working on new assessment for Stage 5 upgrade.',
    version: 1,
  },
];

const parseJson = (value, fallback) => {
  if (value == null || value === '') return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

async function createDatabaseIfNeeded() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.end();
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      organization_id VARCHAR(255) NOT NULL,
      organization_name VARCHAR(255) NOT NULL,
      region_id VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS regions (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      health_office_id VARCHAR(255) NOT NULL,
      hospital_count INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS hospitals (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      region_id VARCHAR(50) NOT NULL,
      region_name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      bed_count INT NOT NULL,
      city VARCHAR(255) NOT NULL,
      current_emram_stage INT NOT NULL,
      last_assessment_date VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS assessments (
      id VARCHAR(50) PRIMARY KEY,
      hospital_id VARCHAR(50) NOT NULL,
      hospital_name VARCHAR(255) NOT NULL,
      region_id VARCHAR(50),
      status VARCHAR(50) NOT NULL,
      current_stage INT NOT NULL,
      target_stage INT NOT NULL,
      created_at VARCHAR(50) NOT NULL,
      updated_at VARCHAR(50) NOT NULL,
      submitted_at VARCHAR(50),
      reviewed_at VARCHAR(50),
      validated_at VARCHAR(50),
      answers JSON,
      total_score INT NOT NULL DEFAULT 0,
      category_scores JSON,
      created_by VARCHAR(50),
      reviewed_by VARCHAR(50),
      validated_by VARCHAR(50),
      hospital_notes TEXT,
      reviewer_comments TEXT,
      ministry_comments TEXT,
      version INT NOT NULL DEFAULT 1,
      previous_version_id VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );

  const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users;');
  if (Array.isArray(userRows) && userRows[0]?.count === 0) {
    for (const user of SAMPLE_USERS) {
      await pool.execute(
        'INSERT INTO users (id, name, email, role, organization_id, organization_name, region_id) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [user.id, user.name, user.email, user.role, user.organizationId, user.organizationName, user.regionId || null]
      );
    }
  }

  const [regionRows] = await pool.query('SELECT COUNT(*) as count FROM regions;');
  if (Array.isArray(regionRows) && regionRows[0]?.count === 0) {
    for (const region of SAMPLE_REGIONS) {
      await pool.execute(
        'INSERT INTO regions (id, name, health_office_id, hospital_count) VALUES (?, ?, ?, ?);',
        [region.id, region.name, region.healthOfficeId, region.hospitalCount]
      );
    }
  }

  const [hospitalRows] = await pool.query('SELECT COUNT(*) as count FROM hospitals;');
  if (Array.isArray(hospitalRows) && hospitalRows[0]?.count === 0) {
    for (const hospital of SAMPLE_HOSPITALS) {
      await pool.execute(
        'INSERT INTO hospitals (id, name, region_id, region_name, type, bed_count, city, current_emram_stage, last_assessment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [
          hospital.id,
          hospital.name,
          hospital.regionId,
          hospital.regionName,
          hospital.type,
          hospital.bedCount,
          hospital.city,
          hospital.currentEMRAMStage,
          hospital.lastAssessmentDate || null,
        ]
      );
    }
  }

  const [assessmentRows] = await pool.query('SELECT COUNT(*) as count FROM assessments;');
  if (Array.isArray(assessmentRows) && assessmentRows[0]?.count === 0) {
    for (const assessment of SAMPLE_ASSESSMENTS) {
      await pool.execute(
        `INSERT INTO assessments (
          id,
          hospital_id,
          hospital_name,
          region_id,
          status,
          current_stage,
          target_stage,
          created_at,
          updated_at,
          submitted_at,
          reviewed_at,
          validated_at,
          answers,
          total_score,
          category_scores,
          created_by,
          reviewed_by,
          validated_by,
          hospital_notes,
          reviewer_comments,
          ministry_comments,
          version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          assessment.id,
          assessment.hospitalId,
          assessment.hospitalName,
          assessment.regionId,
          assessment.status,
          assessment.currentStage,
          assessment.targetStage,
          assessment.createdAt,
          assessment.updatedAt,
          assessment.submittedAt || null,
          assessment.reviewedAt || null,
          assessment.validatedAt || null,
          JSON.stringify(assessment.answers || []),
          assessment.totalScore || 0,
          JSON.stringify(assessment.categoryScores || {}),
          assessment.createdBy || null,
          assessment.reviewedBy || null,
          assessment.validatedBy || null,
          assessment.hospitalNotes || null,
          assessment.reviewerComments || null,
          assessment.ministryComments || null,
          assessment.version || 1,
        ]
      );
    }
  }
}

function mapAssessmentRow(row) {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    hospitalName: row.hospital_name,
    regionId: row.region_id,
    status: row.status,
    currentStage: Number(row.current_stage),
    targetStage: Number(row.target_stage),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at || undefined,
    reviewedAt: row.reviewed_at || undefined,
    validatedAt: row.validated_at || undefined,
    answers: parseJson(row.answers, []),
    totalScore: Number(row.total_score),
    categoryScores: parseJson(row.category_scores, {}),
    createdBy: row.created_by || undefined,
    reviewedBy: row.reviewed_by || undefined,
    validatedBy: row.validated_by || undefined,
    hospitalNotes: row.hospital_notes || undefined,
    reviewerComments: row.reviewer_comments || undefined,
    ministryComments: row.ministry_comments || undefined,
    version: Number(row.version),
    previousVersionId: row.previous_version_id || undefined,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users;');
    return res.json(rows);
  } catch (error) {
    console.error('Failed to load users:', error);
    return res.status(500).json({ message: 'Gagal memuat data pengguna.' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?;', [req.params.id]);
    const user = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Failed to load user:', error);
    return res.status(500).json({ message: 'Gagal memuat data pengguna.' });
  }
});

app.get('/api/regions', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM regions;');
    return res.json(rows);
  } catch (error) {
    console.error('Failed to load regions:', error);
    return res.status(500).json({ message: 'Gagal memuat data region.' });
  }
});

app.get('/api/hospitals', async (req, res) => {
  const { regionId } = req.query;
  try {
    let query = 'SELECT * FROM hospitals';
    const params = [];
    if (regionId) {
      query += ' WHERE region_id = ?';
      params.push(regionId);
    }
    query += ';';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Failed to load hospitals:', error);
    return res.status(500).json({ message: 'Gagal memuat data rumah sakit.' });
  }
});

app.get('/api/hospitals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hospitals WHERE id = ?;', [req.params.id]);
    const hospital = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital tidak ditemukan.' });
    }
    return res.json(hospital);
  } catch (error) {
    console.error('Failed to load hospital:', error);
    return res.status(500).json({ message: 'Gagal memuat data rumah sakit.' });
  }
});

app.get('/api/assessments', async (req, res) => {
  const { hospitalId, regionId, status } = req.query;
  try {
    let query = 'SELECT * FROM assessments';
    const clauses = [];
    const params = [];

    if (hospitalId) {
      clauses.push('hospital_id = ?');
      params.push(hospitalId);
    }
    if (regionId) {
      clauses.push('region_id = ?');
      params.push(regionId);
    }
    if (status) {
      clauses.push('status = ?');
      params.push(status);
    }
    if (clauses.length) {
      query += ' WHERE ' + clauses.join(' AND ');
    }
    query += ' ORDER BY created_at DESC;';
    const [rows] = await pool.query(query, params);
    return res.json(Array.isArray(rows) ? rows.map(mapAssessmentRow) : []);
  } catch (error) {
    console.error('Failed to load assessments:', error);
    return res.status(500).json({ message: 'Gagal memuat data assessment.' });
  }
});

app.get('/api/assessments/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ?;', [req.params.id]);
    const assessment = Array.isArray(rows) && rows[0] ? mapAssessmentRow(rows[0]) : null;
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan.' });
    }
    return res.json(assessment);
  } catch (error) {
    console.error('Failed to load assessment:', error);
    return res.status(500).json({ message: 'Gagal memuat data assessment.' });
  }
});

app.post('/api/assessments', async (req, res) => {
  const {
    id,
    hospitalId,
    hospitalName,
    regionId,
    status,
    currentStage,
    targetStage,
    answers,
    totalScore,
    categoryScores,
    createdBy,
    reviewedBy,
    validatedBy,
    hospitalNotes,
    reviewerComments,
    ministryComments,
    version,
    previousVersionId,
  } = req.body;

  if (!hospitalId || !hospitalName || !status || currentStage == null || targetStage == null) {
    return res.status(400).json({ message: 'Field assessment required not provided.' });
  }

  const assessmentId = id || `a${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  try {
    await pool.execute(
      `INSERT INTO assessments (
        id,
        hospital_id,
        hospital_name,
        region_id,
        status,
        current_stage,
        target_stage,
        created_at,
        updated_at,
        submitted_at,
        reviewed_at,
        validated_at,
        answers,
        total_score,
        category_scores,
        created_by,
        reviewed_by,
        validated_by,
        hospital_notes,
        reviewer_comments,
        ministry_comments,
        version,
        previous_version_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        assessmentId,
        hospitalId,
        hospitalName,
        regionId || null,
        status,
        currentStage,
        targetStage,
        timestamp,
        timestamp,
        null,
        null,
        null,
        JSON.stringify(answers || []),
        totalScore || 0,
        JSON.stringify(categoryScores || {}),
        createdBy || null,
        reviewedBy || null,
        validatedBy || null,
        hospitalNotes || null,
        reviewerComments || null,
        ministryComments || null,
        version || 1,
        previousVersionId || null,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ?;', [assessmentId]);
    return res.status(201).json(mapAssessmentRow(Array.isArray(rows) ? rows[0] : rows));
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return res.status(500).json({ message: 'Gagal menyimpan assessment.' });
  }
});

app.patch('/api/assessments/:id', async (req, res) => {
  const allowedFields = [
    'hospitalId',
    'hospitalName',
    'regionId',
    'status',
    'currentStage',
    'targetStage',
    'submittedAt',
    'reviewedAt',
    'validatedAt',
    'answers',
    'totalScore',
    'categoryScores',
    'createdBy',
    'reviewedBy',
    'validatedBy',
    'hospitalNotes',
    'reviewerComments',
    'ministryComments',
    'version',
    'previousVersionId',
  ];
  const updates = req.body;
  const dataToUpdate = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      dataToUpdate[key] = updates[key];
    }
  }

  if (!Object.keys(dataToUpdate).length) {
    return res.status(400).json({ message: 'Tidak ada field valid untuk diupdate.' });
  }

  const fields = [];
  const params = [];
  if (dataToUpdate.hospitalId !== undefined) {
    fields.push('hospital_id = ?');
    params.push(dataToUpdate.hospitalId);
  }
  if (dataToUpdate.hospitalName !== undefined) {
    fields.push('hospital_name = ?');
    params.push(dataToUpdate.hospitalName);
  }
  if (dataToUpdate.regionId !== undefined) {
    fields.push('region_id = ?');
    params.push(dataToUpdate.regionId || null);
  }
  if (dataToUpdate.status !== undefined) {
    fields.push('status = ?');
    params.push(dataToUpdate.status);
  }
  if (dataToUpdate.currentStage !== undefined) {
    fields.push('current_stage = ?');
    params.push(dataToUpdate.currentStage);
  }
  if (dataToUpdate.targetStage !== undefined) {
    fields.push('target_stage = ?');
    params.push(dataToUpdate.targetStage);
  }
  if (dataToUpdate.submittedAt !== undefined) {
    fields.push('submitted_at = ?');
    params.push(dataToUpdate.submittedAt || null);
  }
  if (dataToUpdate.reviewedAt !== undefined) {
    fields.push('reviewed_at = ?');
    params.push(dataToUpdate.reviewedAt || null);
  }
  if (dataToUpdate.validatedAt !== undefined) {
    fields.push('validated_at = ?');
    params.push(dataToUpdate.validatedAt || null);
  }
  if (dataToUpdate.answers !== undefined) {
    fields.push('answers = ?');
    params.push(JSON.stringify(dataToUpdate.answers || []));
  }
  if (dataToUpdate.totalScore !== undefined) {
    fields.push('total_score = ?');
    params.push(dataToUpdate.totalScore);
  }
  if (dataToUpdate.categoryScores !== undefined) {
    fields.push('category_scores = ?');
    params.push(JSON.stringify(dataToUpdate.categoryScores || {}));
  }
  if (dataToUpdate.createdBy !== undefined) {
    fields.push('created_by = ?');
    params.push(dataToUpdate.createdBy || null);
  }
  if (dataToUpdate.reviewedBy !== undefined) {
    fields.push('reviewed_by = ?');
    params.push(dataToUpdate.reviewedBy || null);
  }
  if (dataToUpdate.validatedBy !== undefined) {
    fields.push('validated_by = ?');
    params.push(dataToUpdate.validatedBy || null);
  }
  if (dataToUpdate.hospitalNotes !== undefined) {
    fields.push('hospital_notes = ?');
    params.push(dataToUpdate.hospitalNotes || null);
  }
  if (dataToUpdate.reviewerComments !== undefined) {
    fields.push('reviewer_comments = ?');
    params.push(dataToUpdate.reviewerComments || null);
  }
  if (dataToUpdate.ministryComments !== undefined) {
    fields.push('ministry_comments = ?');
    params.push(dataToUpdate.ministryComments || null);
  }
  if (dataToUpdate.version !== undefined) {
    fields.push('version = ?');
    params.push(dataToUpdate.version);
  }
  if (dataToUpdate.previousVersionId !== undefined) {
    fields.push('previous_version_id = ?');
    params.push(dataToUpdate.previousVersionId || null);
  }

  fields.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(req.params.id);

  try {
    const query = `UPDATE assessments SET ${fields.join(', ')} WHERE id = ?;`;
    await pool.execute(query, params);
    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ?;', [req.params.id]);
    const assessment = Array.isArray(rows) && rows[0] ? mapAssessmentRow(rows[0]) : null;
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment tidak ditemukan setelah update.' });
    }
    return res.json(assessment);
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return res.status(500).json({ message: 'Gagal memperbarui assessment.' });
  }
});

app.listen(Number(PORT), async () => {
  try {
    await createDatabaseIfNeeded();
    await initDatabase();
    console.log(`API server berjalan pada http://localhost:${PORT}`);
    console.log(`Menggunakan database ${DB_NAME} di ${DB_HOST}:${DB_PORT}`);
  } catch (error) {
    console.error('Gagal menginisialisasi database:', error);
    process.exit(1);
  }
});
