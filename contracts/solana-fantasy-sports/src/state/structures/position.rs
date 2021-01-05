//! State transition types

use num_enum::{TryFromPrimitive,IntoPrimitive};

/// Position state.
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, TryFromPrimitive, IntoPrimitive,)]
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

    // Point Guard
    PG,
    // Shooting Guard
    SG,
    // Small Forward
    SF,
    // Power Forward,
    PF,
    //Center,
    C,
}
impl Default for Position {
    fn default() -> Self {
        Position::Uninitialized
    }
}
