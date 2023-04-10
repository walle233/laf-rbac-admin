import cloud from '@lafjs/cloud';

const db = cloud.database();
const getPermissions = cloud.shared.get('getPermissions');

export async function main(ctx: FunctionContext) {
  // check permission
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  const { data: admin } = await db.collection('admin').where({ _id: uid }).getOne();

  delete admin['password'];
  const { permissions } = await getPermissions(admin._id);

  return {
    code: 0,
    result: {
      ...admin,
      permissions,
    },
  };
}
