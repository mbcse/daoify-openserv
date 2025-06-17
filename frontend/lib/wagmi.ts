import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { aurora } from 'wagmi/chains'
import { createPublicClient } from 'viem'

// Use the same virtual Aurora chain RPC as the backend
const VIRTUAL_AURORA_RPC = 'https://0x4e4541fb.rpc.aurora-cloud.dev'

export const config = createConfig({
  chains: [aurora],
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [aurora.id]: http(VIRTUAL_AURORA_RPC),
  },
})

export const publicClient = createPublicClient({
  chain: aurora,
  transport: http(VIRTUAL_AURORA_RPC),
}) 