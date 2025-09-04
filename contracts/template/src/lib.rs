// Stylus smart contract for the Top Signals Browser (SocialFi/Analytics) Mini-App.
// Implements Researcher NFT minting and token view tracking functionality.

#![cfg_attr(not(any(feature = "export-abi", test)), no_std, no_main)]
extern crate alloc;

use stylus_sdk::{alloy_primitives::U256, prelude::*, storage::StorageU256};
use alloc::{string::String, vec::Vec};
use alloc::vec;
use alloc::format;

use openzeppelin_stylus::token::erc721::Erc721;
use openzeppelin_stylus::token::erc721::IErc721;

/// Main contract struct for the Top Signals Browser
/// - Inherits ERC721 logic from OpenZeppelin Stylus for Researcher NFTs
/// - Includes counter functionality for tracking user interactions
/// - Tracks token views and view counts for analytics
#[entrypoint]
#[storage]
pub struct TopSignalsBrowserContract {
    /// ERC721 implementation (OpenZeppelin Stylus) for Researcher NFTs
    #[borrow]
    pub erc721: Erc721,
    /// Counter for minted Researcher NFTs
    pub researcher_supply: StorageU256,
    /// Mapping from user address to their token view count
    pub user_token_views: StorageU256,
    /// Mapping from user address to Researcher NFT eligibility
    pub researcher_eligibility: StorageU256,
    /// Required token views to mint Researcher NFT
    pub required_views_for_researcher: StorageU256,
    /// Global counter for tracking user interactions
    pub global_counter: StorageU256,
}

/// Public interface for the contract
/// Implements minting, view tracking, and Researcher NFT logic
#[public]
#[inherit(Erc721)]
impl TopSignalsBrowserContract {
    /// Initialize contract with required views for Researcher NFT
    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        self.required_views_for_researcher.set(U256::from(50)); // 50 token views required
        Ok(())
    }

    /// Track a token view for a user
    /// Increments view count and global counter, checks for Researcher NFT eligibility
    pub fn track_token_view(&mut self, _user: alloy_primitives::Address) -> Result<(), Vec<u8>> {
        let current_views = self.user_token_views.get();
        let new_views = current_views + U256::from(1);
        self.user_token_views.set(new_views);

        // Increment global counter
        let current_counter = self.global_counter.get();
        self.global_counter.set(current_counter + U256::from(1));

        // Check if user is eligible for Researcher NFT
        let required_views = self.required_views_for_researcher.get();
        if new_views >= required_views {
            self.researcher_eligibility.set(U256::from(1));
        }

        Ok(())
    }

    /// Mint a Researcher NFT if user is eligible
    pub fn mint_researcher_nft(&mut self) -> Result<(), Vec<u8>> {
        let user = self.vm().msg_sender();
        
        // Check if user is eligible
        let is_eligible = self.researcher_eligibility.get();
        if is_eligible == U256::from(0) {
            return Err(b"User not eligible for Researcher NFT".to_vec());
        }
        
        // Check if user already has a Researcher NFT
        let user_balance = self.erc721.balance_of(user)?;
        if user_balance > U256::from(0) {
            return Err(b"User already has a Researcher NFT".to_vec());
        }
        
        // Mint the Researcher NFT
        let token_id = self.researcher_supply.get() + U256::from(1);
        self.researcher_supply.set(token_id);
        self.erc721._mint(user, token_id)?;
        
        // Reset eligibility to prevent multiple mints
        self.researcher_eligibility.set(U256::from(0));
        
        Ok(())
    }

    /// Get user's token view count
    pub fn get_user_views(&self, _user: alloy_primitives::Address) -> Result<U256, Vec<u8>> {
        Ok(self.user_token_views.get())
    }

    /// Check if user is eligible for Researcher NFT
    pub fn is_researcher_eligible(&self, _user: alloy_primitives::Address) -> Result<bool, Vec<u8>> {
        let eligibility = self.researcher_eligibility.get();
        Ok(eligibility > U256::from(0))
    }

    /// Get required views for Researcher NFT
    pub fn get_required_views(&self) -> Result<U256, Vec<u8>> {
        Ok(self.required_views_for_researcher.get())
    }

    // ===== COUNTER METHODS =====

    /// Gets the current counter value
    pub fn get_counter(&self) -> Result<U256, Vec<u8>> {
        Ok(self.global_counter.get())
    }

    /// Increments the global counter by 1
    pub fn increment_counter(&mut self) -> Result<(), Vec<u8>> {
        let current = self.global_counter.get();
        self.global_counter.set(current + U256::from(1));
        Ok(())
    }

    /// Increments the counter by a specified amount
    pub fn increment_counter_by(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        let current = self.global_counter.get();
        self.global_counter.set(current + amount);
        Ok(())
    }

    /// Sets the counter to a specific value
    pub fn set_counter(&mut self, value: U256) -> Result<(), Vec<u8>> {
        self.global_counter.set(value);
        Ok(())
    }

    /// Resets the counter to zero
    pub fn reset_counter(&mut self) -> Result<(), Vec<u8>> {
        self.global_counter.set(U256::from(0));
        Ok(())
    }

    /// Checks if the counter is a multiple of 10
    pub fn is_counter_multiple_of_ten(&self) -> Result<bool, Vec<u8>> {
        let counter = self.global_counter.get();
        Ok(counter % U256::from(10) == U256::from(0) && counter > U256::from(0))
    }

    /// Gets the next milestone (multiple of 10)
    pub fn get_next_counter_milestone(&self) -> Result<U256, Vec<u8>> {
        let counter = self.global_counter.get();
        let remainder = counter % U256::from(10);
        if remainder == U256::from(0) {
            Ok(counter)
        } else {
            Ok(counter + U256::from(10) - remainder)
        }
    }

    /// Mint NFT when counter reaches multiple of 10
    pub fn mint_nft_at_milestone(&mut self) -> Result<(), Vec<u8>> {
        let user = self.vm().msg_sender();

        // Check if counter is multiple of 10
        let is_milestone = self.is_counter_multiple_of_ten()?;
        if !is_milestone {
            return Err(b"Counter not at milestone (multiple of 10)".to_vec());
        }

        // Check if user already has an NFT
        let user_balance = self.erc721.balance_of(user)?;
        if user_balance > U256::from(0) {
            return Err(b"User already has an NFT".to_vec());
        }

        // Mint the NFT
        let token_id = self.researcher_supply.get() + U256::from(1);
        self.researcher_supply.set(token_id);
        self.erc721._mint(user, token_id)?;

        Ok(())
    }

    pub fn name(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("Top Signals Browser Researcher"))
    }

    pub fn symbol(&self) -> Result<String, Vec<u8>> {
        Ok(String::from("TSBR"))
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, token_id: U256) -> Result<String, Vec<u8>> {
        let image = "/researcher-nft.svg";
        let metadata = format!(
            r#"{{"name":"Top Signals Researcher #{}","description":"NFT awarded to users who have analyzed 50+ tokens in the Top Signals Browser.","image":"{}","attributes":[{{"trait_type":"Role","value":"Researcher"}},{{"trait_type":"Analytics Level","value":"Expert"}}]}}"#,
            token_id,
            image
        );
        Ok(metadata)
    }
}

#[cfg(test)]
mod tests {
    use crate::TopSignalsBrowserContract;
    use openzeppelin_stylus::token::erc721::IErc721;
    use stylus_sdk::alloy_primitives::{address, uint};

    #[motsu::test]
    fn test_researcher_nft_minting(contract: TopSignalsBrowserContract) {
        let test_address = address!("1234567891234567891234567891234567891234");
        let token_id = uint!(1_U256);

        // Test that Researcher NFT can be minted
        let _ = contract.erc721._mint(test_address, token_id);
        let owner = contract.erc721.owner_of(token_id).unwrap();
        assert_eq!(owner, test_address);
    }
}