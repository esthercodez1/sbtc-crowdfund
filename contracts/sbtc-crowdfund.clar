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
(define-constant ERR_CAMPAIGN_NOT_FOUND (err u1002))
(define-constant ERR_CAMPAIGN_ENDED (err u1003))
(define-constant ERR_CAMPAIGN_NOT_ENDED (err u1004))
(define-constant ERR_GOAL_NOT_REACHED (err u1005))
(define-constant ERR_GOAL_REACHED (err u1006))
(define-constant ERR_MILESTONE_INVALID (err u1007))
(define-constant ERR_ALREADY_CLAIMED (err u1008))
(define-constant ERR_NO_CONTRIBUTION (err u1009))
(define-constant ERR_INVALID_AMOUNT (err u1010))
(define-constant ERR_CAMPAIGN_FINALIZED (err u1011))
(define-constant ERR_TRANSFER_FAILED (err u1012))