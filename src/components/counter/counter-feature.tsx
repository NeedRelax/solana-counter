// counter-feature.tsx (无需修改)
'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram } from './counter-data-access'
import { CounterCreate, CounterList } from './counter-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId } = useCounterProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Counter with Authority"
        subtitle={
          'Create a new account by clicking the "Create" button. Only the creator (authority) of an account can modify its state (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <CounterCreate />
      </AppHero>
      <CounterList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}