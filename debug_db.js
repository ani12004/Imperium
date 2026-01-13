import db from './utils/database.js';

const { data: users } = await db.from('users').select('*');
console.log('Total Users:', users ? users.length : 0);
console.log('Users with balance > 0:', users ? users.filter(u => u.balance > 0) : []);

const { data: configs } = await db.from('guild_configs').select('*');
console.log('Guild Configs:', configs);
