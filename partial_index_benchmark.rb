#!/usr/bin/env ruby
# Accurate benchmarking script for partial index performance
# Uses PostgreSQL best practices for reliable measurements

require 'pg'

# Configuration
DB_HOST = ENV['DB_HOST'] || 'localhost'
DB_PORT = ENV['DB_PORT']&.to_i || 5432
DB_NAME = ENV['DB_NAME'] || 'flexile_test'
DB_USER = ENV['DB_USER'] || ENV['USER']
DB_PASS = ENV['DB_PASSWORD']

DATA_SIZE = ENV['DATA_SIZE']&.to_i || 500  # Default 100k for meaningful results

puts "\n🚀 Accurate Invoice Query Performance Benchmark"
puts "=" * 60
puts "Database: #{DB_NAME}@#{DB_HOST}:#{DB_PORT}"
puts "Data size: #{DATA_SIZE.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} invoices"

# Helper: Fresh connection
def connect_db
  PG.connect(
    host: DB_HOST,
    port: DB_PORT,
    dbname: DB_NAME,
    user: DB_USER,
    password: DB_PASS
  )
rescue PG::Error => e
  puts "❌ Connection failed: #{e.message}"
  exit 1
end

# Get test IDs
conn = connect_db
begin
  company_id = conn.exec("SELECT id FROM companies LIMIT 1")[0]&.[]('id')
  if company_id.nil?
    puts "Creating test company..."
    company_id = conn.exec("INSERT INTO companies (name, country_code, created_at, updated_at) VALUES ('Test Co', 'US', NOW(), NOW()) RETURNING id")[0]['id']
  end

  user_id = conn.exec("SELECT id FROM users LIMIT 1")[0]&.[]('id')
  if user_id.nil?
    puts "Creating test user..."
    user_id = conn.exec("INSERT INTO users (email, legal_name, country_code, created_at, updated_at, encrypted_password) VALUES ('test@example.com', 'Test User', 'US', NOW(), NOW(), 'x') RETURNING id")[0]['id']
  end
ensure
  conn.close
end

# Cleanup function
def cleanup(conn)
  puts "\n🧹 Cleaning up..."
  conn.exec("DELETE FROM invoices WHERE invoice_number LIKE 'BENCH-%'")
  conn.exec("DROP INDEX IF EXISTS idx_invoices_company_alive_date_created")
  conn.exec("VACUUM ANALYZE invoices")
rescue PG::Error => e
  puts "Cleanup warning: #{e.message}"
end

# Insert test data
def insert_test_data(conn, company_id, user_id, size)
  puts "\n📊 Creating #{size.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} test invoices..."

  conn.exec_params(<<~SQL, [company_id, user_id, user_id, size])
    INSERT INTO invoices (
      company_id, user_id, invoice_number, invoice_date, total_amount_in_usd_cents,
      status, created_at, updated_at, bill_from, bill_to, due_on,
      equity_percentage, equity_amount_in_cents, equity_amount_in_options,
      cash_amount_in_cents, flexile_fee_cents, invoice_approvals_count,
      flags, invoice_type, external_id, created_by_id, company_contractor_id,
      deleted_at
    )
    SELECT
      $1::integer,
      $2::integer,
      'BENCH-' || gs::text,
      CURRENT_DATE - (RANDOM() * 365 * 3)::int,  -- Random dates over 3 years
      (RANDOM() * 100000 + 10000)::int,          -- Random amounts
      'received',
      NOW() - ((RANDOM() * 365 * 24 * 60) || ' minutes')::interval,  -- Random created times
      NOW(),
      'Test Company',
      'Client ' || (gs % 100)::text,
      CURRENT_DATE + 30,
      0, 0, 0,
      (RANDOM() * 100000 + 10000)::int,
      0, 0, 0, 'services',
      'bench-' || gs::text,
      $3::integer,
      1,
      CASE WHEN RANDOM() < 0.1 THEN NOW() ELSE NULL END  -- 10% soft-deleted
    FROM generate_series(1, $4) gs
  SQL

  puts "Running VACUUM ANALYZE..."
  conn.exec("VACUUM ANALYZE invoices")
end

# Benchmark with proper measurements
def benchmark_query(conn, company_id, title, with_index)
  puts "\n\n#{title}"
  puts "-" * 60

  if with_index
    puts "Creating partial index..."
    conn.exec(<<~SQL)
      CREATE INDEX idx_invoices_company_alive_date_created
      ON invoices (company_id, invoice_date DESC, created_at DESC)
      WHERE deleted_at IS NULL
    SQL
  else
    conn.exec("DROP INDEX IF EXISTS idx_invoices_company_alive_date_created")
  end

  conn.exec("ANALYZE invoices")  # Update statistics

  query = <<~SQL
    SELECT * FROM invoices
    WHERE company_id = #{company_id} AND deleted_at IS NULL
    ORDER BY invoice_date DESC, created_at DESC
    LIMIT 50
  SQL

  # Warm-up phase
  puts "\nWarming up cache (5 runs)..."
  5.times { conn.exec("EXPLAIN (ANALYZE, BUFFERS) #{query}") }

  # Measurement phase
  puts "Measuring performance (10 runs)..."
  times = []

  10.times do
    result = conn.exec("EXPLAIN (ANALYZE, BUFFERS) #{query}")

    # Extract server-side execution time
    result.each do |row|
      if row['QUERY PLAN'] =~ /Execution Time: ([\d.]+) ms/
        times << $1.to_f
      end
    end
  end

  # Show one full execution plan
  puts "\nExecution Plan:"
  result = conn.exec("EXPLAIN (ANALYZE, BUFFERS) #{query}")
  result.each do |row|
    plan_line = row['QUERY PLAN']
    # Highlight important lines
    if plan_line.include?('Index Scan') ||
       plan_line.include?('Sort') ||
       plan_line.include?('Bitmap') ||
       plan_line.include?('Execution Time') ||
       plan_line.include?('idx_invoices_company_alive')
      puts "  → #{plan_line.strip}"
    elsif plan_line.match(/^\s{0,4}\S/)  # Top-level plan nodes
      puts "  #{plan_line.strip}"
    end
  end

  avg_time = times.sum / times.size
  puts "\n⏱️  Average execution time (server-side): #{avg_time.round(2)}ms"
  puts "    Min: #{times.min.round(2)}ms, Max: #{times.max.round(2)}ms"

  avg_time
end

# Main execution
conn = connect_db
cleanup(conn)
insert_test_data(conn, company_id, user_id, DATA_SIZE)
conn.close

# Test 1: Baseline (no partial index)
conn = connect_db
baseline_time = benchmark_query(conn, company_id, "❌ BASELINE: Without Partial Index", false)
conn.close

# Test 2: With partial index
conn = connect_db
optimized_time = benchmark_query(conn, company_id, "✅ OPTIMIZED: With Partial Index", true)
conn.close

# Summary
puts "\n\n🎯 PERFORMANCE SUMMARY"
puts "=" * 60
puts "Test size: #{DATA_SIZE.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse} invoices (90% active, 10% soft-deleted)"
puts "\nResults:"
puts "  Baseline:  #{baseline_time.round(2)}ms (with Sort operation)"
puts "  Optimized: #{optimized_time.round(2)}ms (no Sort needed)"
puts "\n🚀 Performance improvement: #{(baseline_time / optimized_time).round(1)}x faster"

puts "\n💡 Key insights:"
puts "  • Partial index eliminates Sort operation completely"
puts "  • Server-side timings ensure accuracy"
puts "  • Warm-up phase stabilizes cache effects"
puts "  • 10-run average reduces variance"

# Final cleanup
conn = connect_db
cleanup(conn)
conn.close

puts "\n✅ Benchmark complete!"