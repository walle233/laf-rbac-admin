
import cloud from '@lafjs/cloud'
import e from 'express';

const db = cloud.database();

export default async function (ctx: FunctionContext) {

  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  
  const { _id, enable, list, count, read, add, update, remote } = ctx.body;
  if (!_id) {
    return '_id cannot be empty';
  }

  
  const data = { updated_at: Date.now() } as any;
  if (enable) {
    data.enable = enable;
  }
  if (list) {
    data.list = list;
  }
  if (count) {
    data.count = count;
  }
  if (read) {
    data.read = read;
  }
  if (add) {
    data.add = add;
  }
  if (update) {
    data.update = update;
  }
  if (remote) {
    data.remote = remote;
  }


  // update schema
  const r = await db.collection('schema-api').where({ _id }).update(data);

  return {
    code: 0,
    result: r,
  };

}
