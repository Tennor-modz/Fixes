const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
const PUBLIC_IP = '152.42.187.111';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/proxy-status', function(req, res) {
  exec('docker ps --filter name=wa-proxy --format "{{.Status}}"', function(err, stdout) {
    var online = !err && stdout.trim().startsWith('Up');
    res.json({
      online: online,
      address: PUBLIC_IP,
      chatPort: 5222,
      mediaPort: 443,
      statsPort: 8199
    });
  });
});

app.listen(PORT, '127.0.0.1', function() {
  console.log('Dashboard listening on http://127.0.0.1:' + PORT);
});
