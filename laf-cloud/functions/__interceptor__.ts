export async function main(ctx: FunctionContext) {
    try {
        const _path = ctx.request.path;
        const _paths = _path.split("\/").filter(it => it && it.trim());
        ctx.headers['id'] = _paths[3];
        if (_path.startsWith("/api/cms") && (_paths.length == 3 || _paths.length == 4)) {
            ctx.headers['collection'] = _paths[2]
            if (ctx.method.toUpperCase() == 'GET') {
                ctx.headers['method'] = 'read';
            } else if (ctx.method.toUpperCase() == 'POST') {
                ctx.headers['method'] = 'add';
            } else if (ctx.method.toUpperCase() == 'PUT') {
                ctx.headers['method'] = 'update';
            } else if (ctx.method == 'DELETE') {
                ctx.headers['method.toUpperCase()'] = 'remove';
            }

            const res = await require(`@/schema-api-request`)
            // 由于两个例子中一个返回的json，一个返回的function，所以这里做了一层判断
            if (res.default && typeof res.default === 'function') {
                const instance = await res.default(ctx)
                ctx.response.send(instance)
            } else {
                ctx.response.send(res.default)
            }
            return false;
        }
    } catch (err) { }
    return true;
}