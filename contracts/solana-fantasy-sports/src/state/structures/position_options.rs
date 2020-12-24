//Structure implemented by each league to determine the number of players / position to use
use crate::state::*;
use std::cell::RefCell;

pub struct PositionOptions<'a>{
    data: &'a RefCell<&'a mut [u8]>,
    offset: usize,
}

/*
    Structure to be included in each league
    Get and set the number of players / position available to select for each team in the league
*/
impl <'a> PositionOptions<'a>{
    pub const LEN = NUM_POSITIONS-1; //Ignore type of position: Uninitialized == 6

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
    ) {
        mut_array_refs![
            array_mut_ref![data, self.offset, PositionOptions::LEN],
            1,
            1,
            1,
            1,
            1,
            1
        ]
    }

    // May have to decrement position so that it matches with the position structure and ignores unitialized

    pub fn get_number_by_position(&self,value: Position) -> u8{
        self.slice(&mut self.data.borrow_mut()).value[0]
    }
    pub fn set_number_by_position(pos: Position, value: u8){
        self.slice(&mut self.data.borrow_mut()).pos[0] = value;
    }
}