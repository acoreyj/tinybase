export class DurableObject<Env = unknown> {
  ctx: any;
  env: Env;

  constructor(ctx: any, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }
}
