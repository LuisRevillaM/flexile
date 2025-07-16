# frozen_string_literal: true

class LiquidationScenarioCalculation
  def initialize(scenario)
    @scenario = scenario
    @company = scenario.company
  end

  def process
    LiquidationPayout.transaction do
      scenario.liquidation_payouts.destroy_all
      calculate_equity_payouts
      calculate_convertible_payouts
    end
    scenario
  end

  private
    attr_reader :scenario, :company

    def calculate_equity_payouts
      remaining = scenario.exit_amount_cents.to_d
      payouts = Hash.new { |h, k| h[k] = { preference: 0.to_d, participation: 0.to_d, common: 0.to_d, shares: 0 } }

      share_data.each do |data|
        payouts[[data.company_investor_id, data.share_class_id]][:shares] = data.total_shares
      end

      share_classes_by_rank.each do |share_class|
        holdings = share_data.select { |d| d.share_class_id == share_class.id }
        next if holdings.empty?

        pref_per_share = (share_class.original_issue_price_in_dollars.to_d * 100) * share_class.liquidation_preference_multiple.to_d
        total_pref = pref_per_share * holdings.sum(&:total_shares)
        amount_to_pay = [total_pref, remaining].min
        ratio = total_pref.zero? ? 0 : amount_to_pay / total_pref
        holdings.each do |h|
          paid = (pref_per_share * h.total_shares) * ratio
          payouts[[h.company_investor_id, h.share_class_id]][:preference] += paid
        end
        remaining -= amount_to_pay
        break if remaining.zero?
      end

      eligible_holdings = share_data.select do |d|
        sc = share_class_map[d.share_class_id]
        !sc.preferred || sc.participating
      end
      total_common_shares = eligible_holdings.sum(&:total_shares)
      per_share_common = total_common_shares.zero? ? 0 : remaining / total_common_shares

      eligible_holdings.each do |h|
        sc = share_class_map[h.share_class_id]
        amt = per_share_common * h.total_shares
        if sc.preferred && sc.participating
          cap = if sc.participation_cap_multiple
                   (sc.original_issue_price_in_dollars.to_d * 100 * sc.participation_cap_multiple.to_d * h.total_shares) -
                     payouts[[h.company_investor_id, h.share_class_id]][:preference]
                 end
          amt = [amt, cap].min if cap && cap.positive?
          payouts[[h.company_investor_id, h.share_class_id]][:participation] += amt
        else
          payouts[[h.company_investor_id, h.share_class_id]][:common] += amt
        end
      end

      payouts.each do |(investor_id, sc_id), values|
        total = values.values_at(:preference, :participation, :common).sum
        LiquidationPayout.create!(
          liquidation_scenario: scenario,
          company_investor_id: investor_id,
          share_class: share_class_map[sc_id].name,
          security_type: 'equity',
          number_of_shares: values[:shares],
          payout_amount_cents: total.round,
          liquidation_preference_amount: values[:preference],
          participation_amount: values[:participation],
          common_proceeds_amount: values[:common]
        )
      end
    end

    def calculate_convertible_payouts
      total_shares = share_data.sum(&:total_shares) + company.convertible_securities.sum(:implied_shares)
      share_price = total_shares.zero? ? 0 : scenario.exit_amount_cents.to_d / total_shares

      company.convertible_securities.find_each do |security|
        principal = security.principal_value_in_cents.to_d
        converted = share_price * security.implied_shares.to_d
        amount = [principal, converted].max
        LiquidationPayout.create!(
          liquidation_scenario: scenario,
          company_investor: security.company_investor,
          security_type: 'convertible',
          payout_amount_cents: amount.round,
          liquidation_preference_amount: 0,
          participation_amount: 0,
          common_proceeds_amount: 0
        )
      end
    end

    def share_classes_by_rank
      company.share_classes.order(Arel.sql('COALESCE(seniority_rank, 1_000_000) ASC'))
    end

    def share_class_map
      @share_class_map ||= company.share_classes.index_by(&:id)
    end

    def share_data
      @share_data ||=
        company
          .share_holdings
          .joins(:share_class)
          .group(:company_investor_id, :share_class_id)
          .select('company_investor_id, share_class_id, SUM(number_of_shares) AS total_shares')
    end
end
