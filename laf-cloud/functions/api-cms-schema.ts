import cloud from '@lafjs/cloud';

const db = cloud.database();
const mongodb = cloud.mongo.db;

export default async function (ctx: FunctionContext) {
  const { id, method, collection } = ctx.headers;

  const { total } = await db.collection('schema').where({ collectionName: collection }).count();
  if (total <= 0) {
    return {
      code: 1001,
      message: 'collection not found!',
    };
  }

  const { data: api } = await db.collection('schema-api').where({ collectionName: collection }).getOne();

  if (!api.enable || !api.apis[method].enable) {
    return {
      code: 1002,
      message: `${method} method not yet open!`,
    };
  }


  if ('read' == method) {
    if (id) {
      const { data } = await db.collection(collection).where({ _id: id }).getOne();
      return { code: 0, data: data };
    } else {
      const { page, count, order } = ctx.query;
      let _page = page;
      let _count = count;
      if (!_page) {
        _page = 1;
      }
      if (!_count) {
        _count = 10;
      }

      let dbc = db
        .collection(collection)
        .skip((_page - 1) * _count)
        .limit(parseInt(_count));
      if (order) {
        dbc = dbc.orderBy(order, 'asc');
      }
      const resData = await dbc.get();
      const resCount = await db.collection(collection).count();
      const totalPage = Math.ceil(resCount.total / _count);
      return {
        code: 0,
        data: resData.data,
        page: {
          count: resCount.total,
          cur: _page,
          total: totalPage,
          hasNext: _page < totalPage,
        }
      };
    }
  } else {

    if ('add' == method && ['POST'].indexOf(ctx.method.toUpperCase()) != -1) {
      const data = { created_at: Date.now(), updated_at: Date.now() } as any;
      (
        await db.collection('schema').where({ collectionName: collection }).getOne()
      ).data.fields.forEach((field) => {
        if (['created_at', 'updated_at'].indexOf(field.name) == -1) {
          const k = field.name;
          const v = ctx.body[field.name];
          if (v) {
            if (field.type === 'Boolean') {
              data[k] = v === 'true';
            } else if (field.type === 'Number') {
              data[k] = parseInt(v);
            } else {
              data[k] = v;
            }
          } else {
            if (field.defaultValue) {
              data[k] = field.defaultValue;
            }
          }
        }
      });
      const resAdd = await db.collection(collection).add(data);
      return { code: 0, data: resAdd };
    }

    if (!id) {
      return { code: 10003, message: 'id not null!' };
    }


    if ('update' == method && ['POST', 'PUT'].indexOf(ctx.method.toUpperCase()) != -1) {
      const data = { updated_at: Date.now() } as any;
      (
        await db.collection('schema').where({ collectionName: collection }).getOne()
      ).data.fields.forEach((field) => {
        if (['created_at', 'updated_at'].indexOf(field.name) == -1) {
          const k = field.name;
          const v = ctx.body[field.name];
          if (v) {
            if (field.type === 'Boolean') {
              data[k] = v === 'true';
            } else if (field.type === 'Number') {
              data[k] = parseInt(v);
            } else {
              data[k] = v;
            }
          }
        }
      });
      const resUpdate = await db.collection(collection).doc(id).update(data);
      return { code: 0, data: resUpdate };
    }


    if ('remove' == method && ['POST', 'DELETE'].indexOf(ctx.method.toUpperCase()) != -1) {
      const resRemove = await db.collection(collection).doc(id).remove();
      return { code: 0, data: resRemove };
    }
  }

  return { code: 1000, message: 'method not found!' };
}
