import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.NEXT_PUBLIC_SUPABASE_DB_URL!;

if (!connectionString) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_DB_URL environment variable");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const sql = postgres(connectionString);

async function createSystemConfigurationTables() {
  try {
    // Create system_configuration table
    await sql`
      CREATE TABLE IF NOT EXISTS system_configuration (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_timeout_minutes INTEGER NOT NULL DEFAULT 15,
        transaction_timeout_seconds INTEGER NOT NULL DEFAULT 120,
        max_retry_attempts INTEGER NOT NULL DEFAULT 3,
        maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
        default_receipt_copies INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by TEXT NOT NULL
      );
    `;

    // Create commission_rates table
    await sql`
      CREATE TABLE IF NOT EXISTS commission_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_name TEXT NOT NULL,
        service_provider TEXT NOT NULL,
        commission_type TEXT NOT NULL,
        commission_value DECIMAL(10, 4) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        effective_date DATE NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by TEXT NOT NULL
      );
    `;

    // Create service_providers table
    await sql`
      CREATE TABLE IF NOT EXISTS service_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_name TEXT NOT NULL,
        service_type TEXT NOT NULL,
        api_endpoint TEXT,
        timeout_seconds INTEGER NOT NULL DEFAULT 30,
        retry_attempts INTEGER NOT NULL DEFAULT 3,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_by TEXT NOT NULL
      );
    `;

    // Insert default system configuration if not exists
    await sql`
      INSERT INTO system_configuration (
        session_timeout_minutes,
        transaction_timeout_seconds,
        max_retry_attempts,
        maintenance_mode,
        default_receipt_copies,
        updated_by
      )
      SELECT 15, 120, 3, FALSE, 1, 'system'
      WHERE NOT EXISTS (SELECT 1 FROM system_configuration);
    `;

    // Insert sample service providers
    await sql`
      INSERT INTO service_providers (
        provider_name,
        service_type,
        api_endpoint,
        timeout_seconds,
        retry_attempts,
        is_active,
        updated_by
      )
      VALUES
        ('CFE', 'Electricity', 'https://api.cfe.mx', 60, 3, TRUE, 'system'),
        ('Telmex', 'Telecom', 'https://api.telmex.mx', 45, 3, TRUE, 'system'),
        ('Cablevisión', 'Cable TV', 'https://api.cablevision.mx', 30, 3, TRUE, 'system'),
        ('GNM', 'Internet', 'https://api.gnm.mx', 30, 3, TRUE, 'system'),
        ('Diestel', 'Financial Services', 'https://api.diestel.mx', 60, 2, TRUE, 'system')
      ON CONFLICT DO NOTHING;
    `;

    // Insert sample commission rates
    await sql`
      INSERT INTO commission_rates (
        service_name,
        service_provider,
        commission_type,
        commission_value,
        is_active,
        effective_date,
        updated_by
      )
      VALUES
        ('Pago de CFE', 'CFE', 'fixed', 5.00, TRUE, CURRENT_DATE, 'system'),
        ('Pago de Telmex', 'Telmex', 'percentage', 0.02, TRUE, CURRENT_DATE, 'system'),
        ('Pago de Cablevisión', 'Cablevisión', 'fixed', 10.00, TRUE, CURRENT_DATE, 'system'),
        ('Pago de GNM', 'GNM', 'fixed', 8.00, TRUE, CURRENT_DATE, 'system'),
        ('Pago Diestel', 'Diestel', 'percentage', 0.015, TRUE, CURRENT_DATE, 'system')
      ON CONFLICT DO NOTHING;
    `;
  } catch (error) {
    console.error("Error creating system configuration tables:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run if called directly
if (require.main === module) {
  createSystemConfigurationTables()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

export { createSystemConfigurationTables };
