#![deny(missing_docs)]
#![forbid(unsafe_code)]

//! A Solana Fantasy Sports program

pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod native_mint;
pub mod processor;
pub mod state;

// Export current solana-sdk types for downstream users who may also be building with a different
// solana-sdk version
pub use solana_sdk;

solana_sdk::declare_id!("TokenKEGQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
