import { createAiDrivenDevelopmentEngine } from "./engine_factory.js"
import { runAiDrivenDevelopmentScenario } from "./scenario.js"

async function main() {
  const engine = createAiDrivenDevelopmentEngine()
  await runAiDrivenDevelopmentScenario(engine)
}

await main()
