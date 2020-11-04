//! State transition types

use num_enum::TryFromPrimitive;

/// Position state.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, TryFromPrimitive)]
pub enum Position {
    /// Not yet initialized
    Uninitialized,
    /// RB
    RB,
    //  WR
    WR, 
    //  Q
    QB,
    //  TE
    TE, 
    // K
    K,
    //  DEF
    DEF, 

}
impl Default for Position {
    fn default() -> Self {
        Position::Uninitialized
    }
}
