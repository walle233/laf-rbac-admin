import cloud from '@lafjs/cloud';
import * as crypto from 'crypto';

const db = cloud.database();


export async function main() {
  cloud.shared.set('checkPermission', checkPermission);
  cloud.shared.set('getPermissions', getPermissions);
  cloud.shared.set('hashPassword', hashPassword);
  cloud.shared.set('checkToken', checkToken);

  return {
    code: 0,
    data: 'ok',
  };
}


/**
 * @params token 用户 token
 */
async function checkToken(ctx: FunctionContext): Promise<number> {
  const { token } = ctx.headers;

  if (!token) {
    return 403;
  }

  const tuid = cloud.parseToken(token);
  if (!tuid) {
    return 401;
  }

  const { data: td } = await db.collection('user-token').where({ 'uid': tuid }).getOne();

  if (!td) {
    return 401;
  }

  if (td.expired_at > Date.now()) {
    return 402;
  }

  return 0;
}

/**
 * 判断用户是否有权限
 * @param uid 用户ID
 * @param permission 权限名
 * @returns 0 表示用户有权限， 401 表示用户未登录， 403 表示用户未授权
 */
async function checkPermission(uid: string, permission: string): Promise<number> {
  if (!uid) {
    return 401;
  }
  const { permissions } = await getPermissions(uid);

  if (!permissions.includes(permission)) {
    return 403;
  }
  return 0;
}

/**
 * 通过 user id 获取权限列表
 * @param role_ids
 * @returns
 */
async function getPermissions(uid: string) {
  const db = cloud.database();
  // 查用户
  const { data: admin } = await db.collection('admin').where({ _id: uid }).getOne();

  // 查角色
  const { data: roles } = await db
    .collection('role')
    .where({
      name: {
        $in: admin.roles ?? [],
      },
    })
    .get();

  if (!roles) {
    return { permissions: [], roles: [], user: admin };
  }

  const permissions = [];
  for (const role of roles) {
    const perms = role.permissions ?? [];
    permissions.push(...perms);
  }

  return {
    permissions,
    roles: roles.map((role) => role.name),
    user: admin,
  };
}

/**
 * @param {string} content
 * @return {string}
 */
function hashPassword(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
