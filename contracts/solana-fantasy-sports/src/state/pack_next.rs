
use solana_sdk::{
    program_error::ProgramError,
    program_pack::{Pack},
};

pub trait PackNext: Pack {
    fn unpack_next(input: &[u8]) -> Result<(Self, &[u8]), ProgramError> {
        if input.len() >= Self::LEN {
            let (_input, rest) = input.split_at(Self::LEN);
            return match Self::unpack_unchecked(input) {
                Ok(result) => Ok((result, rest)),
                Err(error) => Err(error)
            }
        } else {
            return Err(ProgramError::InvalidArgument);
        }
    }

    fn pack_next(value: &Self, buf: &mut Vec<u8>) {
        let mut dst = vec![0u8; Self::LEN];
        Self::pack_into_slice(&value, &mut dst);
        buf.extend_from_slice(&dst);
    }
}
