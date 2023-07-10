import cloud from '@lafjs/cloud';

const db = cloud.database();
const mongodb = cloud.mongo.db;

export default async function (ctx: FunctionContext) {
  const { id, method, collection } = ctx.headers;

  const { total } = await db.collection('schema').where({ collectionName: collection }).count();
  if (total <= 0) {
    return {
      code: 1000,
      message: 'collection not found!',
    };
  }

  const {data:open} = await db.collection('schema-api').where({ collectionName: "test" }).getOne();

  if ('read' == method) {
    if (open.enable && !open.read) {
      return {
        code: 1011,
        message: 'read method not yet open!',
      };
    }
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
      console.log(_page);
      console.log(_count);
      let dbc = db
        .collection(collection)
        .skip((_page - 1) * _count)
        .limit(_count);
      if (order) {
        dbc = dbc.orderBy(order, 'asc');
      }
      const resData = await dbc.get();
      const resCount = await db.collection(collection).count();
      const totalPage = resCount.total / _page;
      return {
        code: 0,
        data: resData.data,
        page: {
          count:resCount.total,
          cur:_page,
          total:totalPage,
          hasNext:_page < totalPage,
        }
      };
    }
  } else {
    const { id } = ctx.body;
    const data = {};
    (
      await db.collection('schema').where({ collectionName: collection }).getOne()
    ).data.fields.forEach((field) => {
      if (['created_at', 'updated_at'].indexOf(field.name) == -1) {
        const k = field.name;
        const v = ctx.body[field.name];
        if (v) {
          data[k] = v;
        }
      }
    });

    if (!id) {
      return { code: 10002, message: 'id not null!' };
    }
    if ('add' == method && ['POST'].indexOf(ctx.method.toUpperCase()) != -1) {
      if (open.enable && !open.add) {
        return {
          code: 1012,
          message: 'add method not yet open!',
        };
      }
      const resAdd = await db.collection(collection).add(data);
      return { code: 0, data: resAdd };
    }
    if ('update' == method && ['POST', 'PUT'].indexOf(ctx.method.toUpperCase()) != -1) {
      if (open.enable && !open.update) {
        return {
          code: 1013,
          message: 'update method not yet open!',
        };
      }
      const resUpdate = await db.collection(collection).doc(id).update(data);
      return { code: 0, data: resUpdate };
    }
    if ('remove' == method && ['POST', 'DELETE'].indexOf(ctx.method.toUpperCase()) != -1) {
      if (open.enable && !open.remove) {
        return {
          code: 1014,
          message: 'remove method not yet open!',
        };
      }
      const resRemove = await db.collection(collection).remove(id);
      return { code: 0, data: resRemove };
    }
  }

  return { code: 1000, message: 'method not found!' };
}
