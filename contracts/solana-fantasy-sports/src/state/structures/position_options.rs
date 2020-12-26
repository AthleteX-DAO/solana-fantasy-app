//Structure implemented by each league to determine the number of players / position to use
use crate::state::*;
use std::cell::RefCell;
use solana_program::{
    program_error::ProgramError
};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

pub struct PositionOptions<'a>{
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}

/*
    Structure to be included in each league
    Get and set the number of players / position available to select for each team in the league
*/
impl <'a> PositionOptions<'a>{
    pub const LEN:usize = NUM_POSITIONS as usize -1; //Ignore type of position: Uninitialized == 6

    //Each slice represents a position
    fn slice<'b>(
        &self,
        data: &'b mut [u8],
    ) -> (
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
        &'b mut [u8; 1],
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, PositionOptions::LEN],
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1
        ]
    }
    // May have to decrement position so that it matches with the position structure and ignores unitialized

    //Value is position
    pub fn get_number_by_position(&self,value: usize) -> u8{ 
        let data = &mut self.data.borrow_mut();
        array_mut_ref![data,self.offset+value,1][0]
    }
    /*
    pub fn set_number_by_position(&self,pos: Position, value: u8){
        self.slice(&mut self.data.borrow_mut())[pos] = value;
    }*/
    pub fn set(&self, values: &[u8;11]){
        let data = &mut self.data.borrow_mut();
        array_mut_ref![data, self.offset, PositionOptions::LEN].copy_from_slice(values);
    }

    pub fn new(data: &'a RefCell<&'a mut [u8]>, offset: usize) -> Result<PositionOptions,ProgramError>{
        if data.borrow().len() < Self::LEN + offset {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(PositionOptions{data,offset})
    }
}