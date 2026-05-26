const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const url = process.env.DATABASE_URL;
if (!url) { console.error('No DATABASE_URL'); process.exit(1); }
const client = new Client({ connectionString: url });
client.connect().then(() => {
  const sql = [
    "INSERT INTO schedule.schedule_type(id, code, name) VALUES (1,'REGULAR','Lich chinh'),(2,'MAKEUP','Lich day bu') ON CONFLICT(id) DO NOTHING",
    "INSERT INTO schedule.schedule_status(id, code, name, is_complete) VALUES (1,'NORMAL','Binh thuong',false),(2,'CANCELLED','Da huy',false) ON CONFLICT(id) DO NOTHING"
  ];
  return sql.reduce((p, q) => p.then(() => client.query(q)), Promise.resolve());
}).then(() => {
  console.log('Seed complete');
  return client.end();
}).catch(e => { console.error(e.message); client.end(); process.exit(1); });
