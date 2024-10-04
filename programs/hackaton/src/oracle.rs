// use anchor_lang::prelude::*;
// use pyth_sdk_solana::state::SolanaPriceAccount;
// use std::str::FromStr;
// use pyth_sdk_solana::{load_price_feed_from_account_info, PriceFeed};

// pub fn get_usdt_to_sol_price(oracle_price_feed: &AccountInfo) -> Result<u64> {
//     let price_feed: PriceFeed = load_price_feed_from_account_info(oracle_price_feed)?;
//     let price = price_feed.get_current_price().unwrap();
    
//     // The price is typically provided with a decimal adjustment, so you may need to handle that.
//     Ok(price.price as u64)  // Assuming price is returned as u64 for simplicity.
// }

// pub fn get_sol_to_usdt_price(oracle_price_feed: &AccountInfo) -> Result<u64> {

//     let price_feed: PriceFeed = load_price_feed_from_account_info(oracle_price_feed);
//     let price = price_feed.get_current_price().unwrap();

//     // Invert price if needed, depending on the oracle's output
//     Ok(price.price as u64)
// }



use anchor_lang::{
    prelude::*,
    solana_program::{hash::hash, program::invoke, system_instruction::transfer},
};
use pyth_sdk_solana::state::SolanaPriceAccount;
use std::str::FromStr;
use anchor_spl::token::{self, TokenAccount, Transfer, Token};

declare_id!("6pyKxLcchHcDsfA7TZRJqkHJH81x127rYxBo4xmBEokU");

const SOL_USDC_FEED: &str = "EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"; // Ensure this is the correct feed for USDC/SOL
const STALENESS_THRESHOLD: u64 = 6000000; // staleness threshold in seconds

#[program]
pub mod hackaton {
    use super::*;

    pub fn buy_sol_with_usdc(ctx: Context<Swap>, usdc_amount: u64) -> Result<()> {
        let oracle_price = get_usdc_to_sol_price(&ctx.accounts.oracle_price_feed)?;

        // Calculate SOL to send based on USDC amount and oracle price
        let sol_amount = (usdc_amount as u128)
            .checked_mul(oracle_price as u128)
            .unwrap()
            .checked_div(1_000_000_000) // Adjust for SOL decimals (9)
            .unwrap() as u64;

        // Transfer USDC from user to program's USDC vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_usdc_account.to_account_info(),
            to: ctx.accounts.program_usdc_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), usdc_amount)?;

        // Transfer SOL from program's vault to the user
        let transfer_instruction = transfer(
            &ctx.accounts.program_sol_vault.key(),
            &ctx.accounts.user_sol_account.key(),
            sol_amount,
        );
        invoke(
            &transfer_instruction,
            &[
                ctx.accounts.program_sol_vault.to_account_info(),
                ctx.accounts.user_sol_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn sell_sol_for_usdc(ctx: Context<Swap>, sol_amount: u64) -> Result<()> {
        let oracle_price = get_sol_to_usdc_price(&ctx.accounts.oracle_price_feed)?;

        // Calculate USDC to send based on SOL amount and oracle price
        let usdc_amount = (sol_amount as u128)
            .checked_mul(oracle_price as u128)
            .unwrap()
            .checked_div(1_000_000_000) // Adjust for USDC decimals (6)
            .unwrap() as u64;

        // Transfer SOL from user to program's SOL vault
        let transfer_instruction = transfer(
            &ctx.accounts.user_sol_account.key(),
            &ctx.accounts.program_sol_vault.key(),
            sol_amount,
        );
        invoke(
            &transfer_instruction,
            &[
                ctx.accounts.user_sol_account.to_account_info(),
                ctx.accounts.program_sol_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Transfer USDC from program's USDC vault to the user
        let cpi_accounts = Transfer {
            from: ctx.accounts.program_usdc_vault.to_account_info(),
            to: ctx.accounts.user_usdc_account.to_account_info(),
            authority: ctx.accounts.program_signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), usdc_amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_sol_account: AccountInfo<'info>,
    #[account(mut)]
    pub program_usdc_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub program_sol_vault: AccountInfo<'info>,
    #[account(mut)]
    pub oracle_price_feed: AccountInfo<'info>,
    #[account(mut)]
    pub program_signer: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn get_usdc_to_sol_price(oracle_price_feed: &AccountInfo) -> Result<u64> {
    let price_feed: SolanaPriceAccount = load_price_feed_from_account_info(oracle_price_feed)?;
    let price = price_feed.get_current_price().ok_or_else(|| {
        error!(ErrorCode::InvalidPriceFeed)
    })?;

    // Return the price in the correct format, ensure this matches your price feed's precision
    Ok(price.price as u64)
}

pub fn get_sol_to_usdc_price(oracle_price_feed: &AccountInfo) -> Result<u64> {
    let price_feed: SolanaPriceAccount = load_price_feed_from_account_info(oracle_price_feed)?;
    let price = price_feed.get_current_price().ok_or_else(|| {
        error!(ErrorCode::InvalidPriceFeed)
    })?;

    // Invert price if needed, depending on the oracle's output
    Ok(price.price as u64)
}
