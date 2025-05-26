// service.js
const express = require('express');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const cors = require('cors');
const db = require('./connectDB');
const path = require('path');
const dayjs = require('dayjs');

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(fileUpload());

// Update cors() middleware to allow cookies:
const corsOptions = {
    origin: 'http://localhost:5500', // ✅ include http://
    credentials: true,
};
app.use(cors(corsOptions));

// Upload route to parse and store Excel data
app.post('/upload', async (req, res) => {
  try {
    const files = req.files?.files;
    console.log("req.files:", req.files);
    if (!files) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileList = Array.isArray(files) ? files : [files];
    const connection = await db.getConnection();
    await connection.beginTransaction();

    const insertReport = `
      INSERT INTO interview_reports(interview_date, candidate_name, role, interview_status, result_status, remark, team_member)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const insertEmployee = `
      INSERT INTO new_employees(employee_name, join_date, role, dob, id_card, remark)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (let file of fileList) {
      // Allow only .xls or .xlsx files
      const ext = path.extname(file.name).toLowerCase();
      if (ext !== '.xls' && ext !== '.xlsx') {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Wrong file format: ${file.name}` });
      }

      // Read workbook from buffer
      const workbook = xlsx.read(file.data, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (file.name.startsWith('Daily_report')) {
        const parts = file.name.split('_');
        const team_member = `${parts[2]} ${parts[3].split('.')[0]}`;

        for (let row of data) {
          await connection.execute(insertReport, [
            dayjs(row['Date']).isValid() ? dayjs(row['Date']).format('YYYY-MM-DD') : null,
            row['Candidate Name'] || null,
            row['Role'] || null,
            row['Interview'] || null,
            row['Status'] || null,
            row['Remark'] || '',
            team_member || null,
          ]);
        }
      } else if (file.name.startsWith('New_Employee')) {
        for (let row of data) {
          await connection.execute(insertEmployee, [
            row['Employee Name'] || null,
            dayjs(row['Join Date']).isValid() ? dayjs(row['Join Date']).format('YYYY-MM-DD') : null,
            row['Role'] || null,
            dayjs(row['DOB (Date of Birth)']).isValid() ? dayjs(row['DOB (Date of Birth)']).format('YYYY-MM-DD') : null,
            row['ID Card'] || null,
            row['Remark'] || '',
          ]);
        }
      } else {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Wrong file name pattern: ${file.name}` });
      }
    }

    await connection.commit();
    connection.release();

    res.json({ message: '✅ Upload successful and data saved!' });
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ New route to get dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const [rows] = await db.execute('CALL GetDashboardResult()');
    res.json(rows[0]); // CALL returns an array of results
  } catch (err) {
    console.error('❌ Dashboard fetch failed:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Starting server 
app.listen(port, () => {
    console.log(`🚀 Backend Server running on port ${port}`);
});
