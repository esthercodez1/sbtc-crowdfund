;; title: sbtc-crowdfund
;; version: 1.0.0
;; summary: Bitcoin-backed milestone crowdfunding for Stacks builders
;; description: A decentralized crowdfunding protocol where builders can raise 
;;              capital with milestone-based fund releases and refund protection.
;;              Uses STX for MVP, can upgrade to sBTC via trait.

;; ============================================================================
;; CONSTANTS
;; ============================================================================
(define-constant ERR_NOT_AUTHORIZED (err u1001))