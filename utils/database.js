import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // Ensure env vars are loaded

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; // Export client as default

// Helper functions matching the previous API (but ASYNC)
const guildConfigCache = new Map();

export const getGuildConfig = async (guildId) => {
  if (guildConfigCache.has(guildId)) {
    return guildConfigCache.get(guildId);
  }
  const { data, error } = await supabase
    .from('guild_configs')
    .select('*')
    .eq('guild_id', guildId) // Assuming guild_id is the column name
    .single();

  if (error || !data) {
    // Return default
    return { guild_id: guildId, prefix: ',' };
  }

  guildConfigCache.set(guildId, data);
  return data;
};

export const setGuildConfig = async (guildId, key, value) => {
  // Get current state to ensure we have a full object for upsert, or at least the PK
  let current = await getGuildConfig(guildId);
  current[key] = value;

  // Update cache
  guildConfigCache.set(guildId, current);

  // Upsert to DB
  const { data, error } = await supabase
    .from('guild_configs')
    .upsert(current, { onConflict: 'guild_id' });

  return !error;
};

export const getUser = async (userId, guildId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .match({ user_id: userId, guild_id: guildId })
    .single();

  return data || { user_id: userId, guild_id: guildId, balance: 0, bank: 0, xp: 0, level: 0 };
};

export const updateUser = async (userId, guildId, updates) => {
  const current = await getUser(userId, guildId);
  const updated = { ...current, ...updates };

  const { error } = await supabase
    .from('users')
    .upsert(updated, { onConflict: 'user_id,guild_id' });

  return !error;
};

export const getEconomy = async (userId) => {
  const { data, error } = await supabase
    .from('economy')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data || {
    user_id: userId,
    balance: 0,
    bank: 0,
    last_daily: 0,
    last_work: 0,
    last_rob: 0,
    rules_accepted: 0,
    partner_id: null,
    bio: null,
    marriage_time: null,
    parent_id: null,
    children: '[]'
  };
};

export const updateEconomy = async (userId, updates) => {
  const current = await getEconomy(userId);
  const updated = { ...current, ...updates };

  const { error } = await supabase
    .from('economy')
    .upsert(updated, { onConflict: 'user_id' });

  return !error;
};

export const addItem = async (userId, itemId, count = 1) => {
  // Check existing
  const { data: existing } = await supabase
    .from('inventory')
    .select('*')
    .match({ user_id: userId, item_id: itemId })
    .single();

  if (existing) {
    const newCount = existing.count + count;
    await supabase
      .from('inventory')
      .update({ count: newCount })
      .match({ id: existing.id });
  } else {
    await supabase.from('inventory').insert({
      user_id: userId,
      item_id: itemId,
      count: count
    });
  }
};

export const removeItem = async (userId, itemId, count = 1) => {
  const { data: existing } = await supabase
    .from('inventory')
    .select('*')
    .match({ user_id: userId, item_id: itemId })
    .single();

  if (existing && existing.count >= count) {
    const newCount = existing.count - count;
    if (newCount <= 0) {
      await supabase.from('inventory').delete().eq('id', existing.id);
    } else {
      await supabase
        .from('inventory')
        .update({ count: newCount })
        .eq('id', existing.id);
    }
    return true;
  }
  return false;
};

export const getInventory = async (userId) => {
  const { data } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .gt('count', 0);
  return data || [];
};

export const addWarning = async (guildId, userId, reason) => {
  await supabase.from('warns').insert({
    guild_id: guildId,
    user_id: userId,
    reason: reason,
    timestamp: Date.now()
  });
};

export const getWarnings = async (guildId, userId) => {
  const { data } = await supabase
    .from('warns')
    .select('*')
    .match({ guild_id: guildId, user_id: userId })
    .order('timestamp', { ascending: false });
  return data || [];
};

export const clearWarnings = async (guildId, userId) => {
  await supabase
    .from('warns')
    .delete()
    .match({ guild_id: guildId, user_id: userId });
};

export const removeWarning = async (warningId) => {
  await supabase.from('warns').delete().eq('id', warningId);
};

// Logs
export const setLogChannel = async (guildId, event, channelId) => {
  await supabase
    .from('logs')
    .upsert({ guild_id: guildId, event: event, channel_id: channelId }, { onConflict: 'guild_id,event' });
};

export const getLogChannel = async (guildId, event) => {
  const { data } = await supabase
    .from('logs')
    .select('channel_id')
    .match({ guild_id: guildId, event: event })
    .single();
  return data || null;
};

// Fake Permissions
export const addFakePermission = async (guildId, roleId, permission) => {
  await supabase
    .from('fake_permissions')
    .upsert({ guild_id: guildId, role_id: roleId, permission: permission }, { ignoreDuplicates: true });
};

export const removeFakePermission = async (guildId, roleId, permission) => {
  await supabase
    .from('fake_permissions')
    .delete()
    .match({ guild_id: guildId, role_id: roleId, permission: permission });
};

export const getFakePermissions = async (guildId, roleId) => {
  const { data } = await supabase
    .from('fake_permissions')
    .select('permission')
    .match({ guild_id: guildId, role_id: roleId });
  return data ? data.map(r => r.permission) : [];
};

// Invokes
export const setInvokeMessage = async (guildId, command, message) => {
  await supabase
    .from('invokes')
    .upsert({ guild_id: guildId, command: command, message: message }, { onConflict: 'guild_id,command' });
};

// Aliases
export const addAlias = async (guildId, alias, command) => {
  await supabase
    .from('aliases')
    .upsert({ guild_id: guildId, alias: alias, command: command }, { onConflict: 'guild_id,alias' });
};

export const removeAlias = async (guildId, alias) => {
  await supabase
    .from('aliases')
    .delete()
    .match({ guild_id: guildId, alias: alias });
};

export const getAlias = async (guildId, alias) => {
  const { data } = await supabase
    .from('aliases')
    .select('command')
    .match({ guild_id: guildId, alias: alias })
    .single();
  return data || null;
};

// Automod
export const setAutomod = async (guildId, module, enabled) => {
  let current = await getAutomod(guildId);
  current[module] = enabled ? 1 : 0;

  await supabase
    .from('automod')
    .upsert(current, { onConflict: 'guild_id' });
};

export const getAutomod = async (guildId) => {
  const { data } = await supabase
    .from('automod')
    .select('*')
    .eq('guild_id', guildId)
    .single();
  return data || { guild_id: guildId, links: 0, invites: 0, mass_mentions: 0, bad_words: 0 };
};

// Reaction Roles
export const addReactionRole = async (guildId, channelId, messageId, emoji, roleId) => {
  await supabase
    .from('reaction_roles')
    .upsert({
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
      emoji: emoji,
      role_id: roleId
    }, { onConflict: 'message_id,emoji' });
};

export const removeReactionRole = async (messageId, emoji) => {
  await supabase
    .from('reaction_roles')
    .delete()
    .match({ message_id: messageId, emoji: emoji });
};

export const getReactionRole = async (messageId, emoji) => {
  const { data } = await supabase
    .from('reaction_roles')
    .select('role_id')
    .match({ message_id: messageId, emoji: emoji })
    .single();
  return data || null;
};
