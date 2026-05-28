'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { formatUnits, parseUnits } from 'viem'
import { RAIZ_TOKEN_ADDRESS, RAIZ_TOKEN_ABI } from '@/lib/web3/config'
import { celo, celoAlfajores } from '@reown/appkit/networks'

export function useRaizToken() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()

  const tokenAddress = chainId === celo.id 
    ? RAIZ_TOKEN_ADDRESS[celo.id]
    : RAIZ_TOKEN_ADDRESS[celoAlfajores.id]

  // Read token balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: RAIZ_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: isConnected && !!address && tokenAddress !== '0x0000000000000000000000000000000000000000'
    }
  })

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: RAIZ_TOKEN_ABI,
    functionName: 'decimals',
    query: {
      enabled: tokenAddress !== '0x0000000000000000000000000000000000000000'
    }
  })

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  })

  // Format balance
  const balance = balanceData && decimals
    ? formatUnits(balanceData as bigint, decimals as number)
    : '0'

  // Transfer tokens
  const transfer = async (to: string, amount: string) => {
    if (!decimals) return

    const parsedAmount = parseUnits(amount, decimals as number)
    
    writeContract({
      address: tokenAddress,
      abi: RAIZ_TOKEN_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parsedAmount]
    })
  }

  return {
    balance,
    isConnected,
    address,
    chainId,
    transfer,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    refetchBalance,
    tokenAddress,
    isTokenDeployed: tokenAddress !== '0x0000000000000000000000000000000000000000'
  }
}
