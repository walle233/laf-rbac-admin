import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}