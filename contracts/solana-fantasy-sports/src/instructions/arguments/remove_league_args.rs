use byteorder::{ByteOrder, LittleEndian};
use std::cell::RefCell;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::program_error::ProgramError;

pub struct RemoveLeagueArgs<'a>{
    data: &'a RefCell<&'a [u8]>,
    offset: usize,
}
impl<'a> RemoveLeagueArgs<'a>{
    pub const LEN:usize = 2;
    fn slice<'b>(&self, data: &'b [u8]) -> (&'b [u8; 2], &'b [u8; 0]) {
        array_refs![array_ref![data, self.offset, RemoveLeagueArgs::LEN], 2, 0]
    }
    pub fn get_league_index(&self)->u16{
        LittleEndian::read_u16(self.slice(&mut self.data.borrow()).0)
    }
    pub fn new(data: &'a RefCell<&'a [u8]>, offset: usize) -> Result<RemoveLeagueArgs, ProgramError> {
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidInstructionData);
        }
        Ok(RemoveLeagueArgs { data, offset })
    }
    pub fn copy_to(&self, to: &mut [u8]) {
        let src = self.data.borrow();
        array_mut_ref![to, self.offset, RemoveLeagueArgs::LEN].copy_from_slice(array_ref![
            src,
            self.offset,
            RemoveLeagueArgs::LEN
        ]);
    }
}