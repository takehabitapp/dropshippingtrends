import { ResearchAgency } from '../lib/agency/orchestrator';

async function run() {
  const query = process.argv[2] || "streetwear";
  console.log(`\x1b[36m[CLI]\x1b[0m Iniciando test con la consulta: "${query}"`);

  const agency = new ResearchAgency();
  const results = await agency.runResearchCycle(query);

  console.log('\x1b[32m[CLI] RESULTADOS FINALES:\x1b[0m');
  console.dir(results, { depth: null, colors: true });
}

// Para ejecutar: npx tsx scripts/test_new_agency.ts "búsqueda"
run().catch(console.error);
