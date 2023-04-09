import cloud from '@lafjs/cloud'

const db = cloud.database()
const checkPermission = cloud.shared.get('checkPermission')

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const token = ctx.headers['authorization'].split(' ')[1]
  const parsed = cloud.parseToken(token)
  const uid = parsed.uid
  if (!uid) return { code: 'NO_AUTH', error: "permission denied" }

  // checkPermission
  const code = await checkPermission(uid, 'role.delete')
  if (code) {
    return 'Permission denied'
  }

  const { _id } = body
  if (!_id) {
    return { code: 'INVALID_PARAM', error: 'id cannot be empty' }
  }

  // check id
  const { data: role } = await db.collection('role').where({ _id }).getOne()
  if (!role) {
    return { code: 'INVALID_PARAM', error: 'not exists' }
  }

  // 数据库操作
  const r = await db.collection('role').doc(_id).remove()
  console.log(r)

  return {
    code: 0,
    result: r
  }
}