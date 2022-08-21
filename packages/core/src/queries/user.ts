import { User, CreateUser, Users, UserRole } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { buildUpdateWhere } from '@/database/update-where';
import { conditionalSql, convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  envSet.pool.maybeOne<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.username}=${username}
  `);

export const findUserByEmail = async (email: string) =>
  envSet.pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const findUserByPhone = async (phone: string) =>
  envSet.pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const findUserById = async (id: string) =>
  envSet.pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const findUserByIdentity = async (target: string, userId: string) =>
  envSet.pool.one<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

export const hasUser = async (username: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.username}=${username}
  `);

export const hasUserWithId = async (id: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.id}=${id}
  `);

export const hasUserWithEmail = async (email: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryEmail}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const hasUserWithPhone = async (phone: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryPhone}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const hasUserWithIdentity = async (target: string, userId: string) =>
  envSet.pool.exists(
    sql`
      select ${fields.id}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

const buildUserSearchConditionSql = (search: string) => {
  const searchFields = [fields.primaryEmail, fields.primaryPhone, fields.username, fields.name];
  const conditions = searchFields.map((filedName) => sql`${filedName} like ${'%' + search + '%'}`);

  return sql`${sql.join(conditions, sql` or `)}`;
};

const buildUserConditions = (search?: string, hideAdminUser?: boolean) => {
  if (hideAdminUser) {
    return sql`
      where not (${fields.roleNames}::jsonb?${UserRole.Admin})
      ${conditionalSql(search, (search) => sql`and (${buildUserSearchConditionSql(search)})`)}
    `;
  }

  return sql`
    ${conditionalSql(search, (search) => sql`where ${buildUserSearchConditionSql(search)}`)}
  `;
};

export const countUsers = async (search?: string, hideAdminUser?: boolean) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${buildUserConditions(search, hideAdminUser)}
  `);

export const findUsers = async (
  limit: number,
  offset: number,
  search?: string,
  hideAdminUser?: boolean
) =>
  envSet.pool.any<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildUserConditions(search, hideAdminUser)}
      limit ${limit}
      offset ${offset}
    `
  );

const updateUser = buildUpdateWhere<CreateUser, User>(Users, true);

export const updateUserById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateUser>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => updateUser({ set, where: { id }, jsonbMode });

export const deleteUserById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Users.table, id);
  }
};

export const deleteUserIdentity = async (userId: string, target: string) =>
  envSet.pool.one<User>(sql`
    update ${table}
    set ${fields.identities}=${fields.identities}::jsonb-${target}
    where ${fields.id}=${userId}
    returning *
  `);

export const hasActiveUsers = async () =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    limit 1
  `);
