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
    /// LB
    LB,
    /// DL
    DL,
    /// TE
    TE,
    /// DB
    DB,
    /// QB
    QB,
    /// WR
    WR,
    /// OL
    OL,
}
impl Default for Position {
    fn default() -> Self {
        Position::Uninitialized
    }
}
