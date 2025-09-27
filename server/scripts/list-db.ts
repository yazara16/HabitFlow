import db from '../db';

function list() {
  console.log('Users:');
  const users = db.prepare('SELECT id,name,email,createdAt FROM users').all();
  console.table(users);

  console.log('\nHabits:');
  const habits = db.prepare('SELECT id,userId,name,target,completed,streak,frequency,createdAt FROM habits').all();
  console.table(habits);
}

list();
