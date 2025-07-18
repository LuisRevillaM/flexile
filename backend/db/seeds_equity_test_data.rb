#!/usr/bin/env ruby
# Comprehensive Equity Test Data Seeding Script
# 
# This script generates realistic equity data for development/testing
# including: share classes, investors, holdings, grants, convertibles, and dividends

puts "🚀 Starting comprehensive equity test data generation..."

# Configuration
COMPANY_NAME = "Flexile Technologies Inc."
COMPANY_VALUATION = 50_000_000 # $50M post-Series A valuation
FULLY_DILUTED_SHARES = 10_000_000 # 10M shares outstanding
SHARE_PRICE = 5.00 # $5.00 per share

# Find or update existing company
company = Company.first
if company.nil?
  puts "❌ No company found. Please ensure you have a company in your database."
  exit 1
end

puts "📊 Updating company: #{company.email}"

# Update company with realistic equity data
company.update!(
  name: COMPANY_NAME,
  valuation_in_dollars: COMPANY_VALUATION,
  fully_diluted_shares: FULLY_DILUTED_SHARES,
  equity_grants_enabled: true,
  dividends_allowed: true,
  cap_table_enabled: true
)

puts "✅ Company updated with valuation: $#{COMPANY_VALUATION.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"

# Create Share Classes
puts "\n📈 Creating share classes..."

common_shares = company.share_classes.find_or_create_by(name: "Common") do |sc|
  sc.original_issue_price_in_dollars = 0.01
  sc.hurdle_rate = 0.0
end

preferred_a = company.share_classes.find_or_create_by(name: "Preferred Series A") do |sc|
  sc.original_issue_price_in_dollars = 5.00
  sc.hurdle_rate = 0.08
end

puts "✅ Created share classes: Common, Preferred Series A"

# Create Option Pool
puts "\n🎯 Creating option pool..."

option_pool = company.option_pools.find_or_create_by(name: "2024 Employee Option Pool") do |op|
  op.share_class = common_shares
  op.authorized_shares = 1_500_000 # 15% of company
  op.issued_shares = 0
  op.default_option_expiry_months = 120 # 10 years
  op.termination_exercise_period_months = 3
  op.termination_exercise_period_days = 90
end

puts "✅ Created option pool: #{option_pool.authorized_shares} authorized shares"

# Create Vesting Schedule
puts "\n⏰ Creating vesting schedule..."

vesting_schedule = company.vesting_schedules.find_or_create_by(name: "Standard 4-Year Vesting") do |vs|
  vs.total_vesting_duration_months = 48
  vs.vesting_frequency_months = 12
  vs.cliff_duration_months = 12
end

puts "✅ Created vesting schedule: 4 years with 1-year cliff"

# Find existing user (founder)
founder_user = User.first
if founder_user.nil?
  puts "❌ No user found. Please ensure you have a user in your database."
  exit 1
end

# Update founder user data
founder_user.update!(
  legal_name: "Luis Revilla",
  preferred_name: "Luis",
  country_code: "US"
)

puts "\n👤 Creating founder and investors..."

# Create Founder as Company Investor
founder = company.company_investors.find_or_create_by(user: founder_user) do |ci|
  ci.total_shares = 6_000_000 # 60% ownership
  ci.total_options = 0
  ci.investment_amount_in_cents = 100_00 # $1 for founder shares
end

# Create founder's share holding
founder_holding = founder.share_holdings.find_or_create_by(
  share_class: common_shares,
  name: "Founder Shares"
) do |sh|
  sh.issued_at = 2.years.ago
  sh.originally_acquired_at = 2.years.ago
  sh.number_of_shares = 6_000_000
  sh.share_price_usd = 0.01
  sh.total_amount_in_cents = 60_000_00 # $60,000
  sh.share_holder_name = "Luis Revilla"
end

puts "✅ Created founder: #{founder.total_shares} shares (60%)"

# Create Angel Investor
angel_user = User.find_or_create_by(email: "angel@investor.com") do |u|
  u.legal_name = "Sarah Chen"
  u.preferred_name = "Sarah"
  u.country_code = "US"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 1.year.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = false
  u.sent_invalid_tax_id_email = false
end

angel_investor = company.company_investors.find_or_create_by(user: angel_user) do |ci|
  ci.total_shares = 500_000 # 5% ownership
  ci.total_options = 0
  ci.investment_amount_in_cents = 250_000_00 # $250K investment
end

angel_holding = angel_investor.share_holdings.find_or_create_by(
  share_class: preferred_a,
  name: "Angel Investment"
) do |sh|
  sh.issued_at = 18.months.ago
  sh.originally_acquired_at = 18.months.ago
  sh.number_of_shares = 500_000
  sh.share_price_usd = 0.50
  sh.total_amount_in_cents = 250_000_00
  sh.share_holder_name = "Sarah Chen"
end

puts "✅ Created angel investor: #{angel_investor.total_shares} shares (5%)"

# Create Series A Investor
series_a_user = User.find_or_create_by(email: "invest@acme.vc") do |u|
  u.legal_name = "Acme Ventures"
  u.preferred_name = "Acme VC"
  u.country_code = "US"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 1.year.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = false
  u.sent_invalid_tax_id_email = false
end

series_a_investor = company.company_investors.find_or_create_by(user: series_a_user) do |ci|
  ci.total_shares = 2_000_000 # 20% ownership
  ci.total_options = 0
  ci.investment_amount_in_cents = 10_000_000_00 # $10M investment
end

series_a_holding = series_a_investor.share_holdings.find_or_create_by(
  share_class: preferred_a,
  name: "Series A Investment"
) do |sh|
  sh.issued_at = 12.months.ago
  sh.originally_acquired_at = 12.months.ago
  sh.number_of_shares = 2_000_000
  sh.share_price_usd = 5.00
  sh.total_amount_in_cents = 10_000_000_00
  sh.share_holder_name = "Acme Ventures"
end

puts "✅ Created Series A investor: #{series_a_investor.total_shares} shares (20%)"

puts "\n👥 Creating employee equity grants..."

# Create Employee 1 - CTO
cto_user = User.find_or_create_by(email: "cto@flexile.dev") do |u|
  u.legal_name = "Alex Rodriguez"
  u.preferred_name = "Alex"
  u.country_code = "US"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 1.year.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = true
  u.sent_invalid_tax_id_email = false
end

cto_investor = company.company_investors.find_or_create_by(user: cto_user) do |ci|
  ci.total_shares = 0
  ci.total_options = 400_000
  ci.investment_amount_in_cents = 0
end

cto_grant = cto_investor.equity_grants.find_or_create_by(
  name: "CTO Grant 2024",
  option_pool: option_pool
) do |eg|
  eg.issued_at = 10.months.ago
  eg.expires_at = 10.years.from_now
  eg.number_of_shares = 400_000
  eg.vested_shares = 100_000 # 1 year vested
  eg.exercised_shares = 0
  eg.forfeited_shares = 0
  eg.unvested_shares = 300_000
  eg.share_price_usd = 5.00
  eg.exercise_price_usd = 1.00
  eg.option_grant_type = "ISO"
  eg.issue_date_relationship = "employee"
  eg.board_approval_date = 11.months.ago
  eg.option_holder_name = "Alex Rodriguez"
  eg.vesting_schedule = vesting_schedule
  eg.termination_exercise_period_months = 3
  eg.termination_exercise_period_days = 90
end

puts "✅ Created CTO grant: #{cto_grant.number_of_shares} options"

# Create Employee 2 - Head of Product
product_user = User.find_or_create_by(email: "product@flexile.dev") do |u|
  u.legal_name = "Maria Santos"
  u.preferred_name = "Maria"
  u.country_code = "US"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 8.months.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = true
  u.sent_invalid_tax_id_email = false
end

product_investor = company.company_investors.find_or_create_by(user: product_user) do |ci|
  ci.total_shares = 0
  ci.total_options = 200_000
  ci.investment_amount_in_cents = 0
end

product_grant = product_investor.equity_grants.find_or_create_by(
  name: "Head of Product Grant 2024",
  option_pool: option_pool
) do |eg|
  eg.issued_at = 8.months.ago
  eg.expires_at = 10.years.from_now
  eg.number_of_shares = 200_000
  eg.vested_shares = 50_000 # 8 months vested (partial first year)
  eg.exercised_shares = 0
  eg.forfeited_shares = 0
  eg.unvested_shares = 150_000
  eg.share_price_usd = 5.00
  eg.exercise_price_usd = 1.00
  eg.option_grant_type = "ISO"
  eg.issue_date_relationship = "employee"
  eg.board_approval_date = 9.months.ago
  eg.option_holder_name = "Maria Santos"
  eg.vesting_schedule = vesting_schedule
  eg.termination_exercise_period_months = 3
  eg.termination_exercise_period_days = 90
end

puts "✅ Created Head of Product grant: #{product_grant.number_of_shares} options"

# Update option pool issued shares
option_pool.update!(issued_shares: 600_000) # CTO + Product grants

puts "\n💰 Creating convertible securities..."

# Create SAFE Note
safe_investment = company.convertible_investments.find_or_create_by(
  identifier: "SAFE-2023-001"
) do |ci|
  ci.company_valuation_in_dollars = 20_000_000 # $20M valuation cap
  ci.amount_in_cents = 500_000_00 # $500K investment
  ci.implied_shares = 100_000
  ci.valuation_type = "Pre-money"
  ci.entity_name = "Innovation Fund LP"
  ci.issued_at = 15.months.ago
  ci.convertible_type = "SAFE"
end

safe_user = User.find_or_create_by(email: "safe@innovation.fund") do |u|
  u.legal_name = "Innovation Fund LP"
  u.preferred_name = "Innovation Fund"
  u.country_code = "US"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 15.months.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = false
  u.sent_invalid_tax_id_email = false
end

safe_investor = company.company_investors.find_or_create_by(user: safe_user) do |ci|
  ci.total_shares = 0
  ci.total_options = 0
  ci.investment_amount_in_cents = 500_000_00
end

safe_security = safe_investor.convertible_securities.find_or_create_by(
  convertible_investment: safe_investment
) do |cs|
  cs.principal_value_in_cents = 500_000_00
  cs.issued_at = 15.months.ago
  cs.implied_shares = 100_000
end

puts "✅ Created SAFE note: $500K at $20M valuation cap"

puts "\n📋 Creating dividend rounds..."

# Create historical dividend round
dividend_round = company.dividend_rounds.find_or_create_by(
  issued_at: 6.months.ago
) do |dr|
  dr.number_of_shares = 8_500_000 # Only vested shares eligible
  dr.number_of_shareholders = 4
  dr.total_amount_in_cents = 1_000_000_00 # $1M dividend
  dr.status = "Paid"
  dr.ready_for_payment = true
end

puts "✅ Created dividend round: $1M distributed 6 months ago"

# Create individual dividend payments
dividends_data = [
  { investor: founder, shares: 6_000_000, amount: 705_882_00 }, # $705,882
  { investor: angel_investor, shares: 500_000, amount: 58_824_00 }, # $58,824
  { investor: series_a_investor, shares: 2_000_000, amount: 235_294_00 }, # $235,294
  { investor: cto_investor, shares: 0, amount: 0 } # No vested options at time
]

dividends_data.each do |div_data|
  next if div_data[:amount] == 0
  
  dividend_round.dividends.find_or_create_by(
    company_investor: div_data[:investor]
  ) do |d|
    d.number_of_shares = div_data[:shares]
    d.dividend_amount_in_usd = div_data[:amount] / 100.0
    d.total_amount_in_usd = div_data[:amount] / 100.0
    d.paid_at = 6.months.ago
  end
end

puts "✅ Created #{dividend_round.dividends.count} dividend payments"

puts "\n📊 Final equity summary:"
puts "=" * 50

total_shares = company.company_investors.sum(:total_shares)
total_options = company.company_investors.sum(:total_options)

puts "Total Outstanding Shares: #{total_shares.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
puts "Total Outstanding Options: #{total_options.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
puts "Fully Diluted Shares: #{FULLY_DILUTED_SHARES.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
puts "Company Valuation: $#{COMPANY_VALUATION.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"

puts "\nOwnership Breakdown:"
company.company_investors.includes(:user).each do |investor|
  ownership_pct = (investor.total_shares.to_f / FULLY_DILUTED_SHARES * 100).round(2)
  puts "  #{investor.user.legal_name}: #{ownership_pct}% (#{investor.total_shares.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} shares)"
end

puts "\nShare Classes:"
company.share_classes.each do |sc|
  holdings_count = sc.share_holdings.count
  total_shares_in_class = sc.share_holdings.sum(:number_of_shares)
  puts "  #{sc.name}: #{holdings_count} holdings, #{total_shares_in_class.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} shares"
end

puts "\n✅ Equity test data generation complete!"
puts "🎉 Your development environment now has comprehensive equity data for testing."