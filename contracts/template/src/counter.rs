//!
//! Stylus Counter Contract for Top Signals Browser
//!
//! This contract implements a simple counter that tracks user interactions.
//! When the counter reaches multiples of 10, users can mint NFTs.
//!
//! The program is ABI-equivalent with Solidity, which means you can call it from both Solidity and Rust.
//! To do this, run `cargo stylus export-abi`.
//!
//! Note: this code is a template-only and has not been audited.
//!

// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{alloy_primitives::U256, prelude::*};

// Define some persistent storage using the Solidity ABI.
// `Counter` will be the entrypoint.
sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 number;
    }
}

/// Declare that `Counter` is a contract with the following external methods.
#[public]
impl Counter {
    /// Gets the number from storage.
    pub fn number(&self) -> U256 {
        self.number.get()
    }

    /// Sets a number in storage to a user-specified value.
    pub fn set_number(&mut self, new_number: U256) {
        self.number.set(new_number);
    }

    /// Sets a number in storage to a user-specified value.
    pub fn mul_number(&mut self, new_number: U256) {
        self.number.set(new_number * self.number.get());
    }

    /// Sets a number in storage to a user-specified value.
    pub fn add_number(&mut self, new_number: U256) {
        self.number.set(new_number + self.number.get());
    }

    /// Increments `number` and updates its value in storage.
    pub fn increment(&mut self) {
        let number = self.number.get();
        self.set_number(number + U256::from(1));
    }

    /// Increments the counter by a specified amount
    pub fn increment_by(&mut self, amount: U256) {
        let number = self.number.get();
        self.set_number(number + amount);
    }

    /// Resets the counter to zero
    pub fn reset(&mut self) {
        self.number.set(U256::from(0));
    }

    /// Checks if the current number is a multiple of 10
    pub fn is_multiple_of_ten(&self) -> bool {
        let number = self.number.get();
        number % U256::from(10) == U256::from(0) && number > U256::from(0)
    }

    /// Gets the next multiple of 10 that can trigger NFT minting
    pub fn next_milestone(&self) -> U256 {
        let number = self.number.get();
        let remainder = number % U256::from(10);
        if remainder == U256::from(0) {
            number
        } else {
            number + U256::from(10) - remainder
        }
    }
}
