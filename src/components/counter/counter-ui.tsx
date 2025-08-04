// counter-ui.tsx
'use client'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { Keypair } from '@solana/web3.js'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'

export function CounterCreate() {
  const { initialize } = useCounterProgram()
  const { publicKey } = useWallet()

  return (
    <Button
      onClick={() => initialize.mutateAsync(Keypair.generate())}
      disabled={!publicKey || initialize.isPending}
    >
      Create {initialize.isPending && '...'}
    </Button>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey.toBase58()}  />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account: accountString }: { account: string }){
  const { accountQuery, incrementMutation, setMutation, decrementMutation, closeMutation } = useCounterProgramAccount({
    account: accountString,
  });
  const { publicKey } = useWallet()
  const count = useMemo(() => {
    return accountQuery.data?.count?.toString() ?? '0'
  }, [accountQuery.data?.count])
  const authority = useMemo(() => accountQuery.data?.authority, [accountQuery.data?.authority])

  const isAuthority = useMemo(() => {
    return publicKey && authority && publicKey.toBase58() === authority.toBase58()
  }, [publicKey, authority])

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>Counter: {accountQuery.data?.count.toString() ?? '0'}</CardTitle>
        <CardDescription className="flex flex-col space-y-1">
          <span>
             Account: <ExplorerLink path={`account/${accountString}`} label={ellipsify(accountString)} />
          </span>
          {authority && (
            <span className="text-xs">
              Authority: <ExplorerLink path={`account/${authority}`} label={ellipsify(authority.toString())} />
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAuthority && publicKey && (
          <div className="alert alert-warning text-xs mb-4">
            You are not the authority of this account. You can view it, but not modify it.
          </div>
        )}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => incrementMutation.mutateAsync()}
            disabled={!isAuthority || incrementMutation.isPending}
          >
            Increment
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const valueStr = window.prompt('Set value to:', count.toString() ?? '0')
              if (!valueStr || isNaN(parseInt(valueStr))) {
                return
              }
              if (valueStr === count) {
                console.log('Value is the same, no need to set.')
                return
              }

              try {
                const valueAsBn = new BN(valueStr)
                return setMutation.mutateAsync(valueAsBn)
              } catch (e) {
                console.error('Error creating BN from input', e)
                alert('Invalid number provided.')
              }
            }}
            disabled={!isAuthority || setMutation.isPending}
          >
            Set
          </Button>
          <Button
            variant="outline"
            onClick={() => decrementMutation.mutateAsync()}
            disabled={!isAuthority || decrementMutation.isPending}
          >
            Decrement
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!window.confirm('Are you sure you want to close this account?')) {
                return
              }
              return closeMutation.mutateAsync()
            }}
            disabled={!isAuthority || closeMutation.isPending}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}