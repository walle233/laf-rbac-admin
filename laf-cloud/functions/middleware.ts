export interface Middleware {
  (ctx, next: () => Promise<void>): Promise<void>;
}

export function middlewares(ms: Middleware[]) {
  return async (ctx) => {
    const exec = async (index: number) => {
      if (index === ms.length) return;

      const middleware = ms[index];

      const next = () => exec(index + 1);

      await middleware(ctx, next);
    };
    return exec(0);
  }
}


