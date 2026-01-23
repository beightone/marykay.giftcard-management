import { json } from 'co-body'

import { Query, Mutation } from '../resolvers'

type ResolverMap = Record<string, any>

const buildArgs = async (ctx: Context) => {
  if (ctx.method === 'GET') {
    return ctx.query || {}
  }

  const body = await json(ctx.req)

  return body || {}
}

export const restQueryHandler = async (ctx: Context) => {
  const { operation } = ctx.vtex.route.params as { operation: string }
  const resolver = (Query as ResolverMap)[operation]

  if (!resolver) {
    ctx.status = 404
    ctx.body = { error: `Query "${operation}" not found` }

    return
  }

  try {
    const args = await buildArgs(ctx)
    const result = await resolver(null, args, ctx)

    ctx.status = 200
    ctx.body = { data: result }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      errorMessage: (error as Error).message || 'Unexpected error',
      error,
    }
  }
}

export const restMutationHandler = async (ctx: Context) => {
  const { operation } = ctx.vtex.route.params as { operation: string }
  const resolver = (Mutation as ResolverMap)[operation]

  if (!resolver) {
    ctx.status = 404
    ctx.body = { error: `Mutation "${operation}" not found` }

    return
  }

  try {
    const args = await buildArgs(ctx)
    const result = await resolver(null, args, ctx)

    ctx.status = 200
    ctx.body = { data: result }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      errorMessage: (error as Error).message || 'Unexpected error',
      error,
    }
  }
}
