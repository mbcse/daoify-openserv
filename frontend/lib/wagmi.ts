import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { aurora } from 'wagmi/chains'
import { createPublicClient } from 'viem'
import { defineChain } from 'viem'

// Use the same virtual Aurora chain RPC as the backend
const VIRTUAL_AURORA_RPC = 'https://0x4e4541fb.rpc.aurora-cloud.dev'

// Define your custom Daify chain
export const daifyChain = defineChain({
  id: 1313161723, // Replace with your actual Daify chain ID
  name: 'Daify Network',
  nativeCurrency: {
    name: 'DFY',
    symbol: 'DFY',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [VIRTUAL_AURORA_RPC] }, // Replace with your Daify RPC URL
    public: { http: [VIRTUAL_AURORA_RPC] },
  },
  blockExplorers: {
    default: {
      name: 'Daify Explorer',
      url: 'https://0x4e4541fb.explorer.aurora-cloud.dev', // Replace with your Daify explorer URL
    },
  },
  testnet: false, // Set to true if this is a testnet
})

export const config = createConfig({
  chains: [daifyChain, aurora], // Include both Daify and Aurora chains
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
  ],
  transports: {
    [daifyChain.id]: http(VIRTUAL_AURORA_RPC),
    [aurora.id]: http(VIRTUAL_AURORA_RPC),
  },
})

export const publicClient = createPublicClient({
  chain: daifyChain, // Use Daify chain as default
  transport: http(VIRTUAL_AURORA_RPC),
}) 