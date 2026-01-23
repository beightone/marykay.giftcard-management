import { RecorderState, Service, ServiceContext, method } from '@vtex/api'

import { Clients } from './clients'
import { Query, Mutation } from './resolvers'
import {
  restQueryHandler,
  restMutationHandler,
} from './handlers/RestGraphqlHandler'

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    code: number
  }
}

const clients = {
  implementation: Clients,
  options: {},
}

export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query,
      Mutation,
    },
  },
  routes: {
    giftcardQuery: method({
      GET: [restQueryHandler],
      POST: [restQueryHandler],
    }),
    giftcardMutation: method({
      POST: [restMutationHandler],
    }),
  },
})
