import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { expect, describe, it } from "@jest/globals";

describe("best-practice-counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;

  const counterAccount = anchor.web3.Keypair.generate();

  const authority = provider.wallet.publicKey;

  it("✅ Should initialize the counter correctly", async () => {
    const txSignature = await program.methods
      .initialize()
      .accounts({
        counter: counterAccount.publicKey,
        authority: authority,
      })
      .signers([counterAccount])
      .rpc();


    console.log("Initialize transaction signature", txSignature);
    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber()).toBe(0);
    expect(accountData.authority.toBase58()).toEqual(authority.toBase58());
  });


  it("✅ Should increment the counter", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber()).toBe(1);
  });


  it("✅ Should decrement the counter", async () => {
    await program.methods
      .decrement()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toNumber()).toBe(0);
  });


  it("✅ Should set the counter to a specific value", async () => {
    const setValue = new anchor.BN(42);

    await program.methods
      .set(setValue)
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    const accountData = await program.account.counter.fetch(
      counterAccount.publicKey
    );
    expect(accountData.count.toString()).toBe(setValue.toString());
  });


  it("❌ Should FAIL to modify the counter with an unauthorized user", async () => {
    const unauthorizedUser = anchor.web3.Keypair.generate();

    await provider.connection.requestAirdrop(unauthorizedUser.publicKey, anchor.web3.LAMPORTS_PER_SOL);

    await expect(
      program.methods
        .increment()
        .accounts({
          counter: counterAccount.publicKey,
        })
        .signers([unauthorizedUser])
        .rpc()
    ).rejects.toThrow();
  });


  it("❌ Should FAIL on arithmetic underflow when decrementing from 0", async () => {
    await program.methods
      .set(new anchor.BN(0))
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    await expect(
      program.methods
        .decrement()
        .accounts({
          counter: counterAccount.publicKey,
        })
        .rpc()
    ).rejects.toThrow(/Underflow/);
  });


  it("✅ Should close the counter account and return lamports", async () => {
    const balanceBefore = await provider.connection.getBalance(authority);

    const txSignature = await program.methods
      .close()
      .accounts({
        counter: counterAccount.publicKey,
      })
      .rpc();

    console.log("Close transaction signature", txSignature);

    const balanceAfter = await provider.connection.getBalance(authority);

    await expect(
      program.account.counter.fetch(counterAccount.publicKey)
    ).rejects.toThrow(/Account does not exist or has no data/);

    expect(balanceAfter).toBeGreaterThan(balanceBefore);
  });
});