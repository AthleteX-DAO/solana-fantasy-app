//! State transition types

use num_enum::TryFromPrimitive;

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, TryFromPrimitive)]
pub enum Stage {
    Uninitialized,
    SeasonOpen,
    SeasonComplete,
}
impl Default for Stage {
    fn default() -> Self {
        Stage::Uninitialized
    }
}
