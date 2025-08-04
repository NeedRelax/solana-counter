// counter-data-access.ts
'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { BN } from '@coral-xyz/anchor'

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const { publicKey: authority } = useWallet()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['counter', 'initialize', { cluster, authority }],
    mutationFn: (keypair: Keypair) => {
      if (!authority) {
        return Promise.reject(new Error('Wallet not connected'))
      }
      return program.methods
        .initialize()
        .accounts({
          counter: keypair.publicKey,
          authority: authority,
        })
        .signers([keypair])
        .rpc()
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to initialize account')
    },
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCounterProgramAccount({ account: accountString }: { account: string }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { publicKey: authority } = useWallet()
  const { program, accounts } = useCounterProgram()
  const account = useMemo(() => new PublicKey(accountString), [accountString]);
  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account: account.toBase58() }],
    queryFn: () => program.account.counter.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['counter', 'close', { cluster, account, authority }],
    mutationFn: () => {
      if (!authority) throw new Error('Wallet not connected');
      return program.methods
        .close()
        .accounts({ counter: account })
        .rpc();
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['counter', 'decrement', { cluster, account, authority }],
    mutationFn: () => {
      if (!authority) throw new Error('Wallet not connected');
      return program.methods
        .decrement()
        .accounts({ counter: account })
        .rpc();
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['counter', 'increment', { cluster, account, authority }],
    mutationFn: () => {
      if (!authority) throw new Error('Wallet not connected');
      return program.methods
        .increment()
        .accounts({ counter: account })
        .rpc();
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['counter', 'set', { cluster, account, authority }],
    mutationFn: (value: BN) => {
      if (!authority) throw new Error('Wallet not connected');
      return program.methods
        .set(value)
        .accounts({ counter: account })
        .rpc();
    },
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })


  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}