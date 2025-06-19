import { useAccount } from 'wagmi'
import { daifyChain } from './wagmi'

// Network validation utility hook
export const useNetworkValidation = () => {
  const { chain, isConnected } = useAccount()
  
  const isOnDaifyNetwork = isConnected && chain?.id === daifyChain.id
  
  const validateNetwork = async (): Promise<boolean> => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }
    
    if (!chain || chain.id !== daifyChain.id) {
      // Try to switch to Daify network
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${daifyChain.id.toString(16)}` }],
          })
          return true
        } catch (error: any) {
          if (error.code === 4902) {
            // Chain not added, try to add it
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${daifyChain.id.toString(16)}`,
                    chainName: daifyChain.name,
                    nativeCurrency: daifyChain.nativeCurrency,
                    rpcUrls: [daifyChain.rpcUrls.default.http[0]],
                    blockExplorerUrls: [daifyChain.blockExplorers.default.url],
                  },
                ],
              })
              return true
            } catch (addError) {
              throw new Error('Failed to add Daify Network to wallet')
            }
          } else {
            throw new Error('Please switch to Daify Network before proceeding')
          }
        }
      } else {
        throw new Error('MetaMask not available')
      }
    }
    
    return true
  }
  
  return {
    isOnDaifyNetwork,
    validateNetwork,
    currentChainId: chain?.id,
    requiredChainId: daifyChain.id,
    chainName: daifyChain.name
  }
}

// Function to check if transaction can proceed
export const ensureCorrectNetwork = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  try {
    // Get current chain ID
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
    const currentChainIdDecimal = parseInt(currentChainId, 16)
    
    console.log('Current chain ID:', currentChainIdDecimal, 'Required:', daifyChain.id)
    
    if (currentChainIdDecimal !== daifyChain.id) {
      console.log('Wrong network, attempting to switch...')
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${daifyChain.id.toString(16)}` }],
        })
        
        // Wait for switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Chain not added, add it
          console.log('Adding Daify network...')
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${daifyChain.id.toString(16)}`,
                chainName: daifyChain.name,
                nativeCurrency: daifyChain.nativeCurrency,
                rpcUrls: [daifyChain.rpcUrls.default.http[0]],
                blockExplorerUrls: [daifyChain.blockExplorers.default.url],
              },
            ],
          })
          
          // Wait for add to complete
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          throw new Error('User rejected network switch')
        }
      }
    }
  } catch (error) {
    console.error('Network validation failed:', error)
    throw error
  }
} 