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
(define-constant ERR_INVALID_DEADLINE (err u1013))
(define-constant ERR_INVALID_MILESTONES (err u1014))

(define-constant MIN_GOAL u1000000) ;; 1 STX minimum
(define-constant MAX_MILESTONES u10)
(define-constant MIN_DURATION u144) ;; ~1 day in Bitcoin blocks

;; ============================================================================
;; DATA VARIABLES
;; ============================================================================
(define-data-var campaign-nonce uint u0)
(define-data-var temp-campaign-id uint u0)

;; ============================================================================
;; DATA MAPS
;; ============================================================================
(define-map campaigns uint {
  creator: principal,
  title: (string-ascii 64),
  goal: uint,
  raised: uint,
  deadline: uint,
  milestone-count: uint,
  milestones-completed: uint,
  finalized: bool,
  created-at: uint
})

(define-map milestones { campaign-id: uint, milestone-id: uint } {
  description: (string-ascii 128),
  percentage: uint,
  completed: bool,
  released: bool
})

(define-map contributions { campaign-id: uint, backer: principal } {
  amount: uint,
  refunded: bool
})

;; ============================================================================
;; PRIVATE FUNCTIONS
;; ============================================================================
(define-private (store-milestone-fold 
  (idx uint)
  (state { descriptions: (list 10 (string-ascii 128)), percentages: (list 10 uint), index: uint }))
  (let (
    (campaign-id (var-get temp-campaign-id))
    (descriptions (get descriptions state))
    (percentages (get percentages state))
    (current-index (get index state))
    (desc (element-at? descriptions idx))
    (pct (element-at? percentages idx))
  )
    (match desc
      description 
        (match pct
          percentage 
            (begin
              (map-set milestones { campaign-id: campaign-id, milestone-id: idx } {
                description: description,
                percentage: percentage,
                completed: false,
                released: false
              })
              { descriptions: descriptions, percentages: percentages, index: (+ current-index u1) }
            )
          state
        )
      state
    )
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS
;; ============================================================================

;; Create a new crowdfunding campaign
(define-public (create-campaign 
  (title (string-ascii 64))
  (goal uint)
  (deadline uint)
  (milestone-descriptions (list 10 (string-ascii 128)))
  (milestone-percentages (list 10 uint)))
  (let (
    (campaign-id (+ (var-get campaign-nonce) u1))
    (milestone-count (len milestone-descriptions))
  )
    (asserts! (>= goal MIN_GOAL) ERR_INVALID_AMOUNT)
    (asserts! (> deadline (+ burn-block-height MIN_DURATION)) ERR_INVALID_DEADLINE)
    (asserts! (> milestone-count u0) ERR_INVALID_MILESTONES)
    (asserts! (<= milestone-count MAX_MILESTONES) ERR_INVALID_MILESTONES)
    (asserts! (is-eq milestone-count (len milestone-percentages)) ERR_INVALID_MILESTONES)
    (asserts! (is-eq (fold + milestone-percentages u0) u100) ERR_INVALID_MILESTONES)

    (map-set campaigns campaign-id {
      creator: tx-sender,
      title: title,
      goal: goal,
      raised: u0,
      deadline: deadline,
      milestone-count: milestone-count,
      milestones-completed: u0,
      finalized: false,
      created-at: burn-block-height
    })

    (var-set temp-campaign-id campaign-id)
    (fold store-milestone-fold 
      (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9)
      { descriptions: milestone-descriptions, percentages: milestone-percentages, index: u0 })

    (var-set campaign-nonce campaign-id)

    (print { 
      event: "campaign-created", 
      campaign-id: campaign-id, 
      creator: tx-sender,
      goal: goal,
      deadline: deadline,
      milestones: milestone-count
    })

    (ok campaign-id)
  )
)

;; Contribute STX to a campaign
(define-public (contribute (campaign-id uint) (amount uint))
  (let (
    (campaign (unwrap! (map-get? campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
    (current-contribution (default-to { amount: u0, refunded: false } 
      (map-get? contributions { campaign-id: campaign-id, backer: tx-sender })))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (<= burn-block-height (get deadline campaign)) ERR_CAMPAIGN_ENDED)
    (asserts! (not (get finalized campaign)) ERR_CAMPAIGN_FINALIZED)

    ;; Transfer STX from backer to contract escrow using Clarity 4 current-contract
    (try! (stx-transfer? amount tx-sender current-contract))

    (map-set campaigns campaign-id (merge campaign {
      raised: (+ (get raised campaign) amount)
    }))

    (map-set contributions { campaign-id: campaign-id, backer: tx-sender } {
      amount: (+ (get amount current-contribution) amount),
      refunded: false
    })

    (print { 
      event: "contribution", 
      campaign-id: campaign-id, 
      backer: tx-sender,
      amount: amount,
      total-raised: (+ (get raised campaign) amount)
    })

    (ok true)
  )
)

;; Complete a milestone and release funds (creator only)
(define-public (complete-milestone (campaign-id uint) (milestone-id uint))
  (let (
    (campaign (unwrap! (map-get? campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
    (milestone (unwrap! (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id }) ERR_MILESTONE_INVALID))
    (release-amount (/ (* (get raised campaign) (get percentage milestone)) u100))
    (creator (get creator campaign))
  )
    (asserts! (is-eq tx-sender creator) ERR_NOT_AUTHORIZED)
    (asserts! (>= (get raised campaign) (get goal campaign)) ERR_GOAL_NOT_REACHED)
    (asserts! (not (get completed milestone)) ERR_ALREADY_CLAIMED)
    (asserts! (not (get released milestone)) ERR_ALREADY_CLAIMED)
    (asserts! (is-eq milestone-id (get milestones-completed campaign)) ERR_MILESTONE_INVALID)

    ;; Transfer STX from contract to creator (Clarity 4 as-contract? - body must not return response)
    (try! (as-contract? ((with-stx release-amount)) 
      (unwrap-panic (stx-transfer? release-amount tx-sender creator))))

    (map-set milestones { campaign-id: campaign-id, milestone-id: milestone-id }
      (merge milestone { completed: true, released: true }))

    (map-set campaigns campaign-id (merge campaign {
      milestones-completed: (+ (get milestones-completed campaign) u1),
      finalized: (is-eq (+ milestone-id u1) (get milestone-count campaign))
    }))

    (print { 
      event: "milestone-completed", 
      campaign-id: campaign-id, 
      milestone-id: milestone-id,
      released-amount: release-amount,
      recipient: creator
    })

    (ok release-amount)
  )
)

;; Claim refund if campaign failed
(define-public (claim-refund (campaign-id uint))
  (let (
    (campaign (unwrap! (map-get? campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
    (contribution (unwrap! (map-get? contributions { campaign-id: campaign-id, backer: tx-sender }) ERR_NO_CONTRIBUTION))
    (backer tx-sender)
    (refund-amount (get amount contribution))
  )
    (asserts! (> burn-block-height (get deadline campaign)) ERR_CAMPAIGN_NOT_ENDED)
    (asserts! (< (get raised campaign) (get goal campaign)) ERR_GOAL_REACHED)
    (asserts! (not (get refunded contribution)) ERR_ALREADY_CLAIMED)
    (asserts! (> refund-amount u0) ERR_NO_CONTRIBUTION)

    ;; Transfer STX refund from contract to backer (Clarity 4 as-contract? - body must not return response)
    (try! (as-contract? ((with-stx refund-amount)) 
      (unwrap-panic (stx-transfer? refund-amount tx-sender backer))))

    (map-set contributions { campaign-id: campaign-id, backer: backer }
      (merge contribution { refunded: true }))

    (print { 
      event: "refund-claimed", 
      campaign-id: campaign-id, 
      backer: backer,
      amount: refund-amount
    })

    (ok refund-amount)
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS
;; ============================================================================

(define-read-only (get-campaign (campaign-id uint))
  (map-get? campaigns campaign-id)
)

(define-read-only (get-milestone (campaign-id uint) (milestone-id uint))
  (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id })
)

(define-read-only (get-contribution (campaign-id uint) (backer principal))
  (map-get? contributions { campaign-id: campaign-id, backer: backer })
)

(define-read-only (get-progress (campaign-id uint))
  (match (map-get? campaigns campaign-id)
    campaign (ok (/ (* (get raised campaign) u100) (get goal campaign)))
    ERR_CAMPAIGN_NOT_FOUND
  )
)

(define-read-only (is-campaign-active (campaign-id uint))
  (match (map-get? campaigns campaign-id)
    campaign (and 
      (<= burn-block-height (get deadline campaign))
      (not (get finalized campaign)))
    false
  )
)

(define-read-only (is-campaign-successful (campaign-id uint))
  (match (map-get? campaigns campaign-id)
    campaign (>= (get raised campaign) (get goal campaign))
    false
  )
)

(define-read-only (can-claim-refund (campaign-id uint) (backer principal))
  (match (map-get? campaigns campaign-id)
    campaign 
      (match (map-get? contributions { campaign-id: campaign-id, backer: backer })
        contribution 
          (and 
            (> burn-block-height (get deadline campaign))
            (< (get raised campaign) (get goal campaign))
            (not (get refunded contribution))
            (> (get amount contribution) u0))
        false)
    false
  )
)

(define-read-only (get-total-campaigns)
  (var-get campaign-nonce)
)

(define-read-only (get-contract-stx-balance)
  (stx-get-balance current-contract)
)

(define-read-only (get-contract-principal)
  current-contract
)
