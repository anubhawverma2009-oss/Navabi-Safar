import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PLACES, INITIAL_BUSINESSES, INITIAL_EMERGENCY_SERVICES } from '../src/data/seedData';
import { mapModelPlaceToDb, mapModelBusinessToDb, mapModelEmergencyToDb } from '../src/lib/supabaseClient';

const url = (process.env.VITE_SUPABASE_URL || '').trim();
const key = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!url || !key) {
  console.error('ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runMigration() {
  console.log('=====================================================');
  console.log('NAWABI SAFAR: AUTOMATED SUPABASE DATA MIGRATION');
  console.log('=====================================================');
  console.log(`Source places to migrate: ${INITIAL_PLACES.length}`);
  console.log(`Source businesses to migrate: ${INITIAL_BUSINESSES.length}`);
  console.log(`Source emergency services to migrate: ${INITIAL_EMERGENCY_SERVICES.length}`);
  console.log('-----------------------------------------------------');

  const report = {
    places: { source: INITIAL_PLACES.length, uploaded: 0, updated: 0, inserted: 0, failed: [] as any[] },
    businesses: { source: INITIAL_BUSINESSES.length, uploaded: 0, updated: 0, inserted: 0, failed: [] as any[] },
    emergency: { source: INITIAL_EMERGENCY_SERVICES.length, uploaded: 0, updated: 0, inserted: 0, failed: [] as any[] }
  };

  // 1. MIGRATE PLACES
  console.log('\n[1/3] Migrating Places...');
  for (const place of INITIAL_PLACES) {
    try {
      const dbRecord = mapModelPlaceToDb(place);
      const { error, status } = await supabase
        .from('places')
        .upsert(dbRecord, { onConflict: 'id' });

      if (error) {
        report.places.failed.push({ id: place.id, name: place.name, error: error.message, code: error.code, status });
        console.error(`  ❌ Failed place: ${place.name} (${place.id}) -> ${error.message} [code: ${error.code}]`);
      } else {
        report.places.uploaded++;
        console.log(`  ✓ Synced place: ${place.name} (${place.id})`);
      }
    } catch (err: any) {
      report.places.failed.push({ id: place.id, name: place.name, error: err.message });
      console.error(`  ❌ Exception on place: ${place.name} -> ${err.message}`);
    }
  }

  // 2. MIGRATE LOCAL BUSINESSES
  console.log('\n[2/3] Migrating Local Businesses...');
  for (const biz of INITIAL_BUSINESSES) {
    try {
      const dbRecord = mapModelBusinessToDb(biz);
      const { error, status } = await supabase
        .from('local_businesses')
        .upsert(dbRecord, { onConflict: 'id' });

      if (error) {
        report.businesses.failed.push({ id: biz.id, name: biz.name, error: error.message, code: error.code, status });
        console.error(`  ❌ Failed business: ${biz.name} (${biz.id}) -> ${error.message} [code: ${error.code}]`);
      } else {
        report.businesses.uploaded++;
        console.log(`  ✓ Synced business: ${biz.name} (${biz.id})`);
      }
    } catch (err: any) {
      report.businesses.failed.push({ id: biz.id, name: biz.name, error: err.message });
      console.error(`  ❌ Exception on business: ${biz.name} -> ${err.message}`);
    }
  }

  // 3. MIGRATE EMERGENCY SERVICES
  console.log('\n[3/3] Migrating Emergency Services...');
  for (const emg of INITIAL_EMERGENCY_SERVICES) {
    try {
      const dbRecord = mapModelEmergencyToDb(emg);
      const { error, status } = await supabase
        .from('emergency_services')
        .upsert(dbRecord, { onConflict: 'id' });

      if (error) {
        report.emergency.failed.push({ id: emg.id, name: emg.serviceName, error: error.message, code: error.code, status });
        console.error(`  ❌ Failed emergency service: ${emg.serviceName} (${emg.id}) -> ${error.message} [code: ${error.code}]`);
      } else {
        report.emergency.uploaded++;
        console.log(`  ✓ Synced emergency service: ${emg.serviceName} (${emg.id})`);
      }
    } catch (err: any) {
      report.emergency.failed.push({ id: emg.id, name: emg.serviceName, error: err.message });
      console.error(`  ❌ Exception on emergency service: ${emg.serviceName} -> ${err.message}`);
    }
  }

  // 4. REMOTE READ-BACK VERIFICATION
  console.log('\n=====================================================');
  console.log('REMOTE READ-BACK VERIFICATION');
  console.log('=====================================================');

  const { data: readPlaces, error: readPlacesErr, count: placesCount } = await supabase
    .from('places')
    .select('id, name, status, category', { count: 'exact' });

  const { data: readBiz, error: readBizErr, count: bizCount } = await supabase
    .from('local_businesses')
    .select('id, name, category', { count: 'exact' });

  const { data: readEmerg, error: readEmergErr, count: emergCount } = await supabase
    .from('emergency_services')
    .select('id, service_name, category', { count: 'exact' });

  console.log(`Remote 'places' table status: ${readPlacesErr ? readPlacesErr.message : `COUNT=${placesCount || (readPlaces ? readPlaces.length : 0)}`}`);
  console.log(`Remote 'local_businesses' table status: ${readBizErr ? readBizErr.message : `COUNT=${bizCount || (readBiz ? readBiz.length : 0)}`}`);
  console.log(`Remote 'emergency_services' table status: ${readEmergErr ? readEmergErr.message : `COUNT=${emergCount || (readEmerg ? readEmerg.length : 0)}`}`);

  console.log('\n=====================================================');
  console.log('MIGRATION SUMMARY JSON');
  console.log('=====================================================');
  console.log(JSON.stringify({
    report,
    remoteVerification: {
      places: { error: readPlacesErr?.message || null, count: placesCount || 0 },
      businesses: { error: readBizErr?.message || null, count: bizCount || 0 },
      emergency: { error: readEmergErr?.message || null, count: emergCount || 0 }
    }
  }, null, 2));
}

runMigration();
