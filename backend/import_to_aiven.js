const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const sqlFilePath = path.join(__dirname, '../database', 'cloud_export.sql');

readline.question('Pastel (Tempel) Service URI Aiven secara utuh di sini (termasuk passwordnya):\n> ', async (uri) => {
    if (!uri) {
        console.log("URI tidak boleh kosong!");
        readline.close();
        return;
    }
    
    console.log('\n[1/3] Menghubungkan ke Aiven Cloud...');
    try {
        const connection = await mysql.createConnection({
            uri: uri.trim(),
            multipleStatements: true
        });

        console.log('[2/3] Membaca file database lokal...');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('[3/3] Meng-upload data ke Aiven (mohon tunggu sebentar)...');
        await connection.query(sql);

        console.log('\n🎉 SUCCESS! Data berhasil dipindahkan ke Aiven!');
        console.log('Sekarang Kak Laras bisa lanjut ke Langkah 2 di bagian hosting Render.com!');
        
        await connection.end();
    } catch (err) {
        console.error('\n❌ Gagal memindahkan data:', err.message);
    }
    
    readline.close();
});
