const { exec } = require('child_process');
const path = require('path');

exports.runDbBackup = (req, res) => {
  const scriptPath = path.join(__dirname, '../backup_db.sh'); // adjust if needed

  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Backup script failed: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Backup failed', error: stderr });
    }

    console.log(`✅ Backup Script Output:\n${stdout}`);
    res.json({ success: true, message: 'Backup completed successfully', log: stdout });
  });
};

