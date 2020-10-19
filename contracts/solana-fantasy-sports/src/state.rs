//! State transition types

use byteorder::{ByteOrder, LittleEndian};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use num_enum::TryFromPrimitive;
use solana_sdk::{
    program_error::ProgramError,
    program_option::COption,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

/// Root data.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Root {
    /// Oracle authority used to supply game scores.
    pub oracle_authority: COption<Pubkey>,
    /// An address of an account that stores the latest state.
    pub latest_state_account: Pubkey,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
}
impl Sealed for Root {}
impl IsInitialized for Root {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
impl Pack for Root {
    const LEN: usize = 69;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, 69];
        let (oracle_authority, latest_state_account, is_initialized) =
            array_refs![src, 36, 32, 1];
        let oracle_authority = unpack_coption_key(oracle_authority)?;
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };
        Ok(Root {
            oracle_authority,
            latest_state_account: Pubkey::new_from_array(*latest_state_account),
            is_initialized,
        })
    }
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, 69];
        let (
            oracle_authority_dst,
            latest_state_account_dst,
            is_initialized_dst,
        ) = mut_array_refs![dst, 36, 32, 1];
        let &Root {
            ref oracle_authority,
            ref latest_state_account,
            is_initialized,
        } = self;
        pack_coption_key(oracle_authority, oracle_authority_dst);
        latest_state_account_dst.copy_from_slice(latest_state_account.as_ref());
        is_initialized_dst[0] = is_initialized as u8;
    }
}

/// State data.
#[repr(C)]
#[derive(Debug, PartialEq)]
pub struct State {
    /// test
    pub test: String,
}
impl State {
    /// unpack
    pub fn unpack_from_slice(src: &[u8]) -> Result<Box<Self>, ProgramError> {
        let str_len = LittleEndian::read_u64(&src[0..8]);
        let src = &src[8..];
        // let src = Vec::with_capacity(str_len);

        // array_ref![src, 8, str_len];
        Ok(Box::new(State {
            test: String::from_utf8(src.to_vec()).unwrap(),
        }))
    }
    /// pack
    pub fn pack_into_slice(self) -> Vec<u8> {
        let test = &self.test;
        // let State {
        //     ref test,
        // } = self;
        // let bytes = &test.into_bytes();

        let mut dst = Vec::with_capacity(8 + test.len());
        // let mut dst = [0; 8 + test.len()];
        let test_dst_len = &mut dst[0..8];
        LittleEndian::write_u64(test_dst_len, test.len() as u64);

        let test_dst = &mut dst[8..];
        // let (
        //     test_dst_len,
        //     test_dst,
        // ) = mut_array_refs![dst, 0, 8 + test.len()];
        let bytes = self.test.into_bytes();
        test_dst.copy_from_slice(&bytes);
        dst
    }
}

/// Account state.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, TryFromPrimitive)]
pub enum AccountState {
    /// Account is not yet initialized
    Uninitialized,
    /// Account is initialized; the account owner and/or delegate may perform permitted operations
    /// on this account
    Initialized,
    /// Account has been frozen by the mint freeze authority. Neither the account owner nor
    /// the delegate are able to perform operations on this account.
    Frozen,
}

impl Default for AccountState {
    fn default() -> Self {
        AccountState::Uninitialized
    }
}

// Helpers
fn pack_coption_key(src: &COption<Pubkey>, dst: &mut [u8; 36]) {
    let (tag, body) = mut_array_refs![dst, 4, 32];
    match src {
        COption::Some(key) => {
            *tag = [1, 0, 0, 0];
            body.copy_from_slice(key.as_ref());
        }
        COption::None => {
            *tag = [0; 4];
        }
    }
}
fn unpack_coption_key(src: &[u8; 36]) -> Result<COption<Pubkey>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 32];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(Pubkey::new_from_array(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}
fn pack_coption_u64(src: &COption<u64>, dst: &mut [u8; 12]) {
    let (tag, body) = mut_array_refs![dst, 4, 8];
    match src {
        COption::Some(amount) => {
            *tag = [1, 0, 0, 0];
            *body = amount.to_le_bytes();
        }
        COption::None => {
            *tag = [0; 4];
        }
    }
}
fn unpack_coption_u64(src: &[u8; 12]) -> Result<COption<u64>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 8];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(u64::from_le_bytes(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}
