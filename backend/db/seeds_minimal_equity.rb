#!/usr/bin/env ruby
# Minimal Equity Test Data for Waterfall Playground Testing
# 
# This creates basic equity data without waterfall-specific columns
# to test the client-side playground functionality

puts "🚀 Creating minimal equity test data for playground..."

# Find existing company
company = Company.first
if company.nil?
  puts "❌ No company found. Please ensure you have a company in your database."
  exit 1
end

puts "📊 Using company: #{company.email}"

# Create Share Classes (minimal fields only)
puts "\n📈 Creating share classes..."

common_shares = company.share_classes.find_or_create_by(name: "Common") do |sc|
  sc.original_issue_price_in_dollars = 0.01
end

preferred_a = company.share_classes.find_or_create_by(name: "Preferred Series A") do |sc|
  sc.original_issue_price_in_dollars = 5.00
end

puts "✅ Created share classes: Common, Preferred Series A"

# Find existing user (founder)
founder_user = User.first
if founder_user.nil?
  puts "❌ No user found. Please ensure you have a user in your database."
  exit 1
end

# Update founder user data
founder_user.update!(
  legal_name: "Luis Revilla",
  preferred_name: "Luis"
)

puts "\n👤 Creating investors..."

# Create Founder as Company Investor
founder = company.company_investors.find_or_create_by(user: founder_user) do |ci|
  ci.total_shares = 6_000_000
  ci.total_options = 0
  ci.investment_amount_in_cents = 100_00
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
  sh.total_amount_in_cents = 60_000_00
  sh.share_holder_name = "Luis Revilla"
end

puts "✅ Created founder: #{founder.total_shares} shares"

# Create Angel Investor
angel_user = User.find_or_create_by(email: "angel@investor.com") do |u|
  u.legal_name = "Sarah Chen"
  u.preferred_name = "Sarah"
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
  ci.total_shares = 500_000
  ci.total_options = 0
  ci.investment_amount_in_cents = 250_000_00
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

puts "✅ Created angel investor: #{angel_investor.total_shares} shares"

# Create Series A Investor
series_a_user = User.find_or_create_by(email: "invest@acme.vc") do |u|
  u.legal_name = "Acme Ventures"
  u.preferred_name = "Acme VC"
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
  ci.total_shares = 2_000_000
  ci.total_options = 0
  ci.investment_amount_in_cents = 10_000_000_00
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

puts "✅ Created Series A investor: #{series_a_investor.total_shares} shares"

# Create Strategic Investor
strategic_user = User.find_or_create_by(email: "strategic@bigtech.com") do |u|
  u.legal_name = "BigTech Strategic Fund"
  u.preferred_name = "BigTech"
  u.encrypted_password = "encrypted_password_here"
  u.confirmed_at = 8.months.ago
  u.external_id = SecureRandom.alphanumeric(10)
  u.minimum_dividend_payment_in_cents = 1000
  u.sign_in_count = 0
  u.signed_documents = false
  u.team_member = false
  u.sent_invalid_tax_id_email = false
end

strategic_investor = company.company_investors.find_or_create_by(user: strategic_user) do |ci|
  ci.total_shares = 500_000
  ci.total_options = 0
  ci.investment_amount_in_cents = 2_500_000_00
end

strategic_holding = strategic_investor.share_holdings.find_or_create_by(
  share_class: preferred_a,
  name: "Strategic Investment"
) do |sh|
  sh.issued_at = 8.months.ago
  sh.originally_acquired_at = 8.months.ago
  sh.number_of_shares = 500_000
  sh.share_price_usd = 5.00
  sh.total_amount_in_cents = 2_500_000_00
  sh.share_holder_name = "BigTech Strategic Fund"
end

puts "✅ Created strategic investor: #{strategic_investor.total_shares} shares"

puts "\n📊 Final summary:"
puts "=" * 40

total_shares = company.company_investors.sum(:total_shares)
puts "Total Outstanding Shares: #{total_shares.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"

puts "\nInvestors created:"
company.company_investors.includes(:user).each do |investor|
  ownership_pct = (investor.total_shares.to_f / 9_000_000 * 100).round(2)
  puts "  #{investor.user.legal_name}: #{ownership_pct}% (#{investor.total_shares.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} shares)"
end

puts "\n✅ Minimal equity data creation complete!"
puts "🎉 Your playground should now show 4 investors with realistic cap table data."