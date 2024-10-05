// use anchor_lang::prelude::*;
use anchor_lang::{
    prelude::*,
    solana_program::{clock::Clock, program::invoke, system_instruction::transfer},
};
use anchor_spl::token::{self,Token, Mint, TokenAccount, Transfer};
// use anchor_spl::associated_token::AssociatedToken; 
use pyth_sdk_solana::state::SolanaPriceAccount;
use std::str::FromStr;
// use solana_program::program::invoke;
// use solana_program::system_instruction::transfer;

declare_id!("EadAeXF1xWgLFvDrupAPRgrVGW1HBm6omeX36nRhcsLn");

const SOL_USDC_FEED: &str = "EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw";
const STALENESS_THRESHOLD: u64 = 6000000; // staleness threshold in seconds
const CUSTOM_USDT_MINT: &str = "8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK";


#[program]
pub mod hackaton {
    use super::*;


        pub fn create_ico_ata(
            ctx: Context<InitIcoATA>,
        ) -> Result<()> {
            msg!("create program ATA for hold ICO");
            // transfer ICO admin to program ata
            // let cpi_ctx = CpiContext::new(
            //     ctx.accounts.token_program.to_account_info(),
            //     token::Transfer {
            //         from: ctx.accounts.ico_ata_for_admin.to_account_info(),
            //         to: ctx.accounts.ico_ata_for_ico_program.to_account_info(),
            //         authority: ctx.accounts.admin.to_account_info(),
            //     },
            // );
            // token::transfer(cpi_ctx, ico_amount)?;
            // msg!("send {} ICO to program ATA.", ico_amount);

            // save data in data PDA
            let data = &mut ctx.accounts.data;
            // data.sol = sol_price;
            // data.usdt = usdt_price;
            data.admin = *ctx.accounts.admin.key;
            msg!("save data in program PDA.");
            Ok(())
        }


        pub fn buy_with_sol(
            ctx: Context<BuyWithSol>,
            _ico_ata_for_ico_program_bump: u8,
            sol_amount: u64,
        ) -> Result<()> {

            // Use the SOL/USDT oracle price feed from the constant
            let oracle_price_feed = ctx.accounts.oracle_price_feed.to_account_info();
            if oracle_price_feed.key().to_string() != SOL_USDC_FEED {
                return Err(ErrorCode::InvalidPriceFeed.into());
            }

            //     Fetch the SOL/USDC price from Pyth
            let sol_usdt_price = fetch_pyth_price(&oracle_price_feed)? as u128;
        
            // Convert SOL amount to u128 for precision
            let sol_amount_u128 = sol_amount as u128;

        
            // // Adjust for SOL decimals (9 decimals for SOL tokens)
            // Calculate the USDT amount, adjusting for SOL decimals (9 decimals for SOL tokens)
            let usdt_amount = sol_amount_u128
                .checked_mul(sol_usdt_price) // Multiply SOL amount by the price
                .unwrap()
                .checked_div(1_000_000_000)  // Adjust for SOL decimals
                .unwrap() as u64;

                // transfer sol from user to admin
                let ix = anchor_lang::solana_program::system_instruction::transfer(
                    &ctx.accounts.user.key(),
                    &ctx.accounts.admin.key(),
                    sol_amount,
                );
                anchor_lang::solana_program::program::invoke(
                    &ix,
                    &[
                        ctx.accounts.user.to_account_info(),
                        ctx.accounts.admin.to_account_info(),
                    ],
                )?;
                msg!("transfer {} sol to admin.", sol_amount);

            // transfer ICO from program to user ATA
            // let ico_amount = sol_amount * ctx.accounts.data.sol;
            let ico_mint_address = ctx.accounts.ico_mint.key();
            let seeds = &[ico_mint_address.as_ref(), &[_ico_ata_for_ico_program_bump]];
            let signer = [&seeds[..]];
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.ico_ata_for_ico_program.to_account_info(),
                    to: ctx.accounts.ico_ata_for_user.to_account_info(),
                    authority: ctx.accounts.ico_ata_for_ico_program.to_account_info(),
                },
                &signer,
            );
            token::transfer(cpi_ctx, usdt_amount)?;
            msg!("transfer {} ico to buyer/user.", usdt_amount);
            Ok(())
        }



        pub fn buy_with_usdt(
            ctx: Context<BuyWithSol>,
            _ico_ata_for_ico_program_bump: u8,
            usdt_amount: u64
        ) -> Result<()> {

                // Use the SOL/USDT oracle price feed from the constant
            let oracle_price_feed = ctx.accounts.oracle_price_feed.to_account_info();
            if oracle_price_feed.key().to_string() != SOL_USDC_FEED {
                return Err(ErrorCode::InvalidPriceFeed.into());
            }

            //     Fetch the SOL/USDC price from Pyth
            let sol_usdc_price = fetch_pyth_price(&oracle_price_feed)? as u128;
        
            // // Convert USDC amount to u128 for precision
            let usdc_amount_u128 = usdt_amount as u128;
        
            // // Adjust for SOL decimals (9 decimals for SOL tokens)
            let sol_amount = usdc_amount_u128
                .checked_mul(1_000_000_000)  // Adjust for SOL decimals
                .unwrap()
                .checked_div(sol_usdc_price)
                .unwrap() as u64;

            
            // transfer ICO from program to user ATA
            // let ico_amount = sol_amount * ctx.accounts.data.sol;
            let ico_mint_address = ctx.accounts.ico_mint.key();
                let seeds = &[ico_mint_address.as_ref(), &[_ico_ata_for_ico_program_bump]];
            let signer = [&seeds[..]];
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.ico_ata_for_user.to_account_info(),
                    to: ctx.accounts.ico_ata_for_ico_program.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
                &signer,
            );
            token::transfer(cpi_ctx, sol_amount)?;
            msg!("transfer {} ico to buyer/user.", sol_amount);
            
            
            // transfer sol from admin to user
            **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? -= sol_amount;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += sol_amount;
            // let ix = anchor_lang::solana_program::system_instruction::transfer(
            //     &ctx.accounts.user.key(),
            //     &ctx.accounts.admin.key(),
            //     usdt_amount,
            // );
            // anchor_lang::solana_program::program::invoke(
            //     &ix,
            //     &[
            //         ctx.accounts.user.to_account_info(),
            //         ctx.accounts.admin.to_account_info(),
            //     ],
            // )?;
            msg!("transfer {} sol to admin.", sol_amount);

            Ok(())
        }
        


}


#[derive(Accounts)]
pub struct InitIcoATA<'info> {
    // 1. PDA (pubkey) for ico ATA for our program.
    // seeds: [ico_mint + current program id] => "HashMap[seeds+bump] = pda"
    // token::mint: Token Program wants to know what kind of token this ATA is for
    // token::authority: It's a PDA so the authority is itself!
    #[account(
    init,
    payer = admin,
    seeds = [ CUSTOM_USDT_MINT.parse::<Pubkey>().unwrap().as_ref() ],
    bump,
    token::mint = ico_mint,
    token::authority = ico_ata_for_ico_program,
    )]
    pub ico_ata_for_ico_program: Account<'info, TokenAccount>,

    #[account(init, payer=admin, space=9000, seeds=[b"data", admin.key().as_ref()], bump)]
    pub data: Account<'info, Data>,

    #[account(
    address = CUSTOM_USDT_MINT.parse::<Pubkey>().unwrap(),
    )]
    pub ico_mint: Account<'info, Mint>,

    // #[account(
    //     init,
    //     payer = admin,
    //     token::mint = ico_mint,
    //     token::authority = admin,
    //     )]
    // pub ico_ata_for_admin: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}
/* 
-----------------------------------------------------------
    BuyWithSol struct for buy_with_sol function
-----------------------------------------------------------
*/
#[derive(Accounts)]
#[instruction(_ico_ata_for_ico_program_bump: u8)]
pub struct BuyWithSol<'info> {
    #[account(
    mut,
    seeds = [ ico_mint.key().as_ref() ],
    bump = _ico_ata_for_ico_program_bump,
    )]
    pub ico_ata_for_ico_program: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub data: Account<'info, Data>,

    #[account(
    address = CUSTOM_USDT_MINT.parse::<Pubkey>().unwrap(),
)]
    pub ico_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = user,
        token::mint = ico_mint,
        token::authority = user,
        )]
    pub ico_ata_for_user: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub admin: AccountInfo<'info>,

     #[account(mut)]
     /// CHECK: This is safe
     #[account(address = Pubkey::from_str(SOL_USDC_FEED).unwrap() @ ErrorCode::InvalidPriceFeed)]
     pub oracle_price_feed: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}




#[account]
pub struct Data {
    pub sol: u64,
    pub program_sol_vault: Pubkey,
    pub admin: Pubkey,
}

pub fn fetch_pyth_price(price_feed_info: &AccountInfo) -> Result<f64> {
    let price_feed = SolanaPriceAccount::account_info_to_feed(price_feed_info)
        .map_err(|_| ErrorCode::PriceFetchFailed)?;

    let current_timestamp = Clock::get()?.unix_timestamp;
    let price = price_feed
        .get_price_no_older_than(current_timestamp, STALENESS_THRESHOLD)
        .ok_or(ErrorCode::PriceFetchFailed)?;

    // Convert price to dollars by adjusting with the `expo` value
    let price_in_dollars = (price.price as f64) * 10f64.powi(price.expo);
    
    Ok(price_in_dollars)
}

#[error_code]
pub enum ErrorCode {
    #[msg("Price Fetch Failed")]
    PriceFetchFailed,
    #[msg("Invalid Price Feed")]
    InvalidPriceFeed,
    #[msg("Invalid Token Account")]
    InvalidTokenAccount,
}







//     pub fn buy_sol_with_usdc(ctx: Context<Swap>, usdc_amount: u64) -> Result<()> {
//         // Use the SOL/USDC oracle price feed from the constant
//         let oracle_price_feed = ctx.accounts.oracle_price_feed.to_account_info();
//         if oracle_price_feed.key().to_string() != SOL_USDC_FEED {
//             return Err(ErrorCode::InvalidPriceFeed.into());
//         }
    
//         // Fetch the SOL/USDC price from Pyth
//         let sol_usdc_price = fetch_pyth_price(&oracle_price_feed)? as u128;
    
//         // Convert USDC amount to u128 for precision
//         let usdc_amount_u128 = usdc_amount as u128;
    
//         // Adjust for SOL decimals (9 decimals for SOL tokens)
//         let sol_amount = usdc_amount_u128
//             .checked_mul(1_000_000_000)  // Adjust for SOL decimals
//             .unwrap()
//             .checked_div(sol_usdc_price)
//             .unwrap() as u64;
    
//         // Transfer USDC from user to program's USDC vault
//         let cpi_accounts = Transfer {
//             from: ctx.accounts.user_usdt_account.to_account_info(),
//             to: ctx.accounts.program_usdt_vault.to_account_info(),
//             authority: ctx.accounts.user.to_account_info(),
//         };
//         let cpi_program = ctx.accounts.token_program.to_account_info();
//         token::transfer(CpiContext::new(cpi_program, cpi_accounts), usdc_amount)?;
    
//         // Transfer SOL from program's vault to the user
//         let transfer_instruction = transfer(
//             &ctx.accounts.program_sol_vault.key(),
//             &ctx.accounts.user_sol_account.key(),
//             sol_amount,
//         );
//         invoke(
//             &transfer_instruction,
//             &[
//                 ctx.accounts.program_sol_vault.to_account_info(),
//                 ctx.accounts.user_sol_account.to_account_info(),
//                 ctx.accounts.system_program.to_account_info(),
//             ],
//         )?;
    
//         Ok(())
//     }


//    pub fn sell_sol_for_usdt(ctx: Context<Swap>, sol_amount: u64) -> Result<()> {
//     // Use the SOL/USDT oracle price feed from the constant
//         let oracle_price_feed = ctx.accounts.oracle_price_feed.to_account_info();
//         if oracle_price_feed.key().to_string() != SOL_USDC_FEED {
//             return Err(ErrorCode::InvalidPriceFeed.into());
//         }

//         // let accounts_user_sol_account = ctx.accounts.user_sol_account.key();
//         // let accounts_program_sol_vault = ctx.accounts.program_sol_vault.key();
        

//         // Fetch the SOL/USDT price from the oracle
//         let sol_usdt_price = fetch_pyth_price(&oracle_price_feed)? as u128;

//         // Convert SOL amount to u128 for precision
//         let sol_amount_u128 = sol_amount as u128;

//         // Calculate the USDT amount, adjusting for SOL decimals (9 decimals for SOL tokens)
//         let usdt_amount = sol_amount_u128
//             .checked_mul(sol_usdt_price) // Multiply SOL amount by the price
//             .unwrap()
//             .checked_div(1_000_000_000)  // Adjust for SOL decimals
//             .unwrap() as u64;

//         // Transfer SOL from user to program's SOL vault
//         let transfer_instruction = transfer(
//             &ctx.accounts.user_sol_account.key(),
//             &ctx.accounts.program_sol_vault.key(),
//             sol_amount,
//         );
//         invoke(
//             &transfer_instruction,
//             &[
//                 ctx.accounts.user_sol_account.to_account_info(),
//                 ctx.accounts.program_sol_vault.to_account_info(),
//                 ctx.accounts.system_program.to_account_info(),
//             ],
//         )?;

//         // Transfer USDT from program's vault to the user
//         let cpi_accounts = Transfer {
//             from: ctx.accounts.program_usdt_vault.to_account_info(),
//             to: ctx.accounts.user_usdt_account.to_account_info(),
//             authority: ctx.accounts.user.to_account_info(),
//         };
//         let cpi_program = ctx.accounts.token_program.to_account_info();
//         token::transfer(CpiContext::new(cpi_program, cpi_accounts), usdt_amount)?;

//         Ok(())
// }





// #[derive(Accounts)]
// pub struct Swap<'info> {
//     #[account(mut)]
//     pub user: Signer<'info>,

//     #[account(
//         mut,
//         constraint = user_usdt_account.mint == Pubkey::from_str(CUSTOM_USDT_MINT).unwrap() @ ErrorCode::InvalidTokenAccount
//     )]
//     pub user_usdt_account: Account<'info, TokenAccount>,
//     #[account(mut)]
//     /// CHECK: This is safe
//     pub user_sol_account: AccountInfo<'info>,

//     #[account(
//         init_if_needed,
//         payer = user,
//         space = 8 + 32,
//         // has_one = user,
//         // associated_token::mint = program_sol_vault,
//         // associated_token::authority = user,
//         constraint = program_usdt_vault.mint == Pubkey::from_str(CUSTOM_USDT_MINT).unwrap() @ ErrorCode::InvalidTokenAccount,
//     )]
//     pub program_usdt_vault: Account<'info, TokenAccount>,
//     /// CHECK: This is safe
//     #[account(mut)]
//     pub program_sol_vault: AccountInfo<'info>,

//     // #[account(mut)]
//     /// CHECK: This is safe
//     #[account(address = Pubkey::from_str(SOL_USDC_FEED).unwrap() @ ErrorCode::InvalidPriceFeed)]
//     pub oracle_price_feed: AccountInfo<'info>,
    
//     /// CHECK: This is safe
//     #[account(mut)]
//     // pub token_program: Program<'info, Token>,
//     // pub associated_token_program: Program<'info, AssociatedToken>,
//     pub system_program: Program<'info, System>,
// }






// #[derive(Accounts)]
// pub struct DepositIcoInATA<'info> {
//     #[account(mut)]
//     pub ico_ata_for_ico_program: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub data: Account<'info, Data>,

//     #[account(
//     address = CUSTOM_USDT_MINT.parse::<Pubkey>().unwrap(),
//     )]
//     pub ico_mint: Account<'info, Mint>,

//     #[account(mut)]
//     pub ico_ata_for_admin: Account<'info, TokenAccount>,

//     #[account(mut)]
//     pub admin: Signer<'info>,
//     pub token_program: Program<'info, Token>,
// }




  // pub fn deposit_ico_in_ata(ctx: Context<DepositIcoInATA>, ico_amount: u64) -> Result<()> {
        //     if ctx.accounts.data.admin != *ctx.accounts.admin.key {
        //         // return Err(ProgramError::IncorrectProgramId);
        //     }
        //     // transfer ICO admin to program ata
        //     let cpi_ctx = CpiContext::new(
        //         ctx.accounts.token_program.to_account_info(),
        //         token::Transfer {
        //             from: ctx.accounts.ico_ata_for_admin.to_account_info(),
        //             to: ctx.accounts.ico_ata_for_ico_program.to_account_info(),
        //             authority: ctx.accounts.admin.to_account_info(),
        //         },
        //     );
        //     token::transfer(cpi_ctx, ico_amount)?;
        //     msg!("deposit {} ICO in program ATA.", ico_amount);
        //     Ok(())
        // }








    #[derive(Accounts)]
    #[instruction(_ico_ata_for_ico_program_bump: u8)]
    pub struct BuyWithUsdt<'info> {
        #[account(
        mut,
        seeds = [ ico_mint.key().as_ref() ],
        bump = _ico_ata_for_ico_program_bump,
        )]
        pub ico_ata_for_ico_program: Account<'info, TokenAccount>,
    
        #[account(mut)]
        pub data: Account<'info, Data>,
    
        #[account(
        address = CUSTOM_USDT_MINT.parse::<Pubkey>().unwrap(),
        )]
        pub ico_mint: Account<'info, Mint>,
    
        #[account(mut)]
        pub ico_ata_for_user: Account<'info, TokenAccount>,
    
        #[account(mut)]
        pub usdt_ata_for_user: Account<'info, TokenAccount>,
    
        #[account(mut)]
        pub usdt_ata_for_admin: Account<'info, TokenAccount>,
    
        #[account(mut)]
        pub user: Signer<'info>,
    
        pub token_program: Program<'info, Token>,
    }
