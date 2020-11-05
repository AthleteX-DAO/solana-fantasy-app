//! State transition types
use arrayref::{array_refs, mut_array_refs};
use solana_program::{program_error::ProgramError, program_option::COption, pubkey::Pubkey};

// Helpers
pub fn pack_coption_key(src: &COption<Pubkey>, dst: &mut [u8; 36]) {
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
pub fn unpack_coption_key(src: &[u8; 36]) -> Result<COption<Pubkey>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 32];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(Pubkey::new_from_array(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}
pub fn pack_coption_u64(src: &COption<u64>, dst: &mut [u8; 12]) {
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
pub fn unpack_coption_u64(src: &[u8; 12]) -> Result<COption<u64>, ProgramError> {
    let (tag, body) = array_refs![src, 4, 8];
    match *tag {
        [0, 0, 0, 0] => Ok(COption::None),
        [1, 0, 0, 0] => Ok(COption::Some(u64::from_le_bytes(*body))),
        _ => Err(ProgramError::InvalidAccountData),
    }
}
pub fn unpack_bool(src: &[u8; 1]) -> Result<bool, ProgramError> {
    let is_initialized = match src {
        [0] => false,
        [1] => true,
        _ => return Err(ProgramError::InvalidAccountData),
    };
    return Ok(is_initialized);
}
