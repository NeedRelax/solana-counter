#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("8cVigJXbu5VwLLZhVp4hQb4CTZENsdzgy2HbDni2K3fJ");

#[program]
pub mod counter {
    use super::*;
    pub fn initialize(ctx:Context<Initialize>)-> Result<()>{
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.authority.key();
        msg!("Counter initialized for authority: {}", ctx.accounts.authority.key());
        Ok(())
    }
    pub fn increment(ctx:Context<Update>)-> Result<()>{
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
    pub fn decrement(ctx:Context<Update>)-> Result<()>{
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_sub(1).ok_or(ErrorCode::Underflow)?;
        Ok(())
    }
    pub fn set(ctx:Context<Update>,value:u64)->Result<()>{
        ctx.accounts.counter.count = value;
        Ok(())
    }
    pub fn close(_ctx:Context<Close>)->Result<()>{
        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info>{
    #[account(
    init,
    payer=authority,
    space = 8 + Counter::INIT_SPACE,
    )]
    pub counter :Account<'info, Counter>,
    #[account(mut)]
    pub authority:Signer<'info>,
    pub system_program:Program<'info, System>,
}


#[derive(Accounts)]
pub struct Update<'info>{
    #[account(mut,has_one=authority)]
    pub counter:Account<'info, Counter>,
    pub authority:Signer<'info>
}

#[derive(Accounts)]
pub struct Close<'info>{
    #[account(mut,has_one=authority,close=authority)]
    pub counter:Account<'info, Counter>,
    pub authority:Signer<'info>
}
#[account]
#[derive(InitSpace)]
pub struct Counter{
    pub count:u64,
    pub authority:Pubkey,
}
#[error_code]
pub enum ErrorCode{
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Arithmetic underflow")]
    Underflow,
}

