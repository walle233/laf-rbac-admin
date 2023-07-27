import cloud from '@lafjs/cloud';
import { Middleware, middlewares } from '@/middleware'

const db = cloud.database();


const logger: Middleware = async (ctx, next) => {
    const data = {
        url: ctx.request.url,
        headers: ctx.headers
    };
    if (ctx.params && ctx.params.length > 0) {
        data['params'] = ctx.params;
    }
    if (ctx.body && ctx.body.length > 0) {
        data['body'] = ctx.body;
    }
    console.log(data);
    next();
}


const app = middlewares([logger]);

export async function main(ctx: FunctionContext) {
    await app(ctx);
    try {
        const _path = ctx.request.path;
        const _paths = _path.split("\/").filter(it => it && it.trim());
        if (_path.startsWith("/api/cms") && _paths.length >= 3) {
            const { data: sapi } = await db.collection('schema-api').where(
                { collectionName: (_paths[2] === 'schema' ? _paths[3] : _paths[2]) }
            ).getOne();
            if (sapi && sapi.enable) {
                if (_paths[2] === 'schema') {
                    return await handleSchemaApi(ctx, _paths, sapi);
                } else {
                    return await handleOtherApi(ctx, _paths, sapi);
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
    return true;
}

async function handleSchemaApi(ctx: FunctionContext, paths: string[], sapi) {
    try {
        const collectionName = sapi.collectionName;
        const mt = ctx.method.toUpperCase();
        if (paths[4]) {
            ctx.headers['id'] = paths[4];
        }
        ctx.headers['collection'] = collectionName;
        switch (mt) {
            default:
            case 'GET':
                ctx.headers['method'] = 'read'
                break;
            case 'POST':
                ctx.headers['method'] = 'add'
                break;
            case 'PUT':
                ctx.headers['method'] = 'update'
                break;
            case 'DELETE':
                ctx.headers['method'] = 'remove'
                break;
        }

        const api = findApi(ctx.headers['method'], sapi.apis);
        if (api && api.enable) {
            if (api.token) {
                const invalid = await checkUserValidate(ctx);
                if (invalid) {
                    ctx.response.json(invalid);
                    return false;
                }
            }

            const res = await require(`@/${api.target}`);
            if (res.default && typeof res.default === 'function') {
                const instance = await res.default(ctx)
                ctx.response.send(instance)
            } else {
                ctx.response.send(res.default)
            }
            return false;
        }
    } catch (err) {
        console.log(err);
    }
    return true;
}



async function handleOtherApi(ctx: FunctionContext, paths: string[], sapi) {
    try {
        const targetName = paths[3];
        const api = findApi(targetName, sapi.apis);
        if (api && api.enable) {
            if (api.token) {
                const invalid = await checkUserValidate(ctx);
                if (invalid) {
                    ctx.response.json(invalid);
                    return false;
                }
            }
            const res = await require(`@/${api.target}`);
            if (res.default && typeof res.default === 'function') {
                const instance = await res.default(ctx)
                ctx.response.send(instance)
            } else {
                ctx.response.send(res.default)
            }
            return false;
        }
    } catch (err) {
        console.log(err);
    }
    return true;
}

function findApi(name, apis) {
    return apis[name];
}


async function checkUserValidate(ctx: FunctionContext) {
    const { authorization: token } = ctx.headers;

    if (!token) {
        return { code: 401, message: "用户未登录" };
    }

    const parsed = cloud.parseToken(token);
    const tuid = parsed.uid;
    if (!tuid) {
        return { code: 403, message: "无效的 Token" };
    }

    const { data: td } = await db.collection('user-token').where({ 'uid': tuid, 'token': token }).getOne();

    if (!td) {
        return { code: 403, message: "无效的 Token" };
    }

    if (td.expired_at < Date.now()) {
        return { code: 402, message: "Token 已过期" };
    }

    // 保存 uid 信息
    ctx.headers['uid'] = tuid;

}


