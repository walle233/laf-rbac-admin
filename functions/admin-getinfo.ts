import cloud from '@lafjs/cloud'

const getPermissions = cloud.shared.get('getPermissions')

export async function main (ctx: FunctionContext) {
  const db = cloud.database()
  console.log('authorization', ctx.headers['authorization'])
  const token = ctx.headers['authorization'].split(' ')[1]
  const parsed = parseToken(token)
  console.log(token, parsed)
  console.log('parsed', ctx.auth)
  ctx.auth = parsed
  const uid = ctx.auth?.uid
  if (!uid) return { code: 'NO_AUTH', error: "permission denied" }

  const { data: admin } = await db.collection('admin')
    .where({ _id: uid })
    .getOne()

  delete admin['password']
  const { permissions } = await getPermissions(admin._id)

  return {
    code: 0,
    result: {
      ...admin,
      permissions
    }
  }
}

function parseToken(token: string) {
  return cloud.parseToken(token)
}