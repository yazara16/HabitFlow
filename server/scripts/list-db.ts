import db from '../db';

async function list() {
  console.log('Users:');
  const users = await db.all('SELECT id,name,email,createdAt FROM users');
  console.table(users);

  console.log('\nHabits:');
  const habits = await db.all('SELECT id,userId,name,target,completed,streak,frequency,createdAt FROM habits');
  console.table(habits);
}

list().catch((e) => { console.error(e); process.exit(1); });
