import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceUrl =
  process.env.API_DOCS_URL ?? 'http://localhost:8080/v3/api-docs'
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const contractPath = resolve(scriptDirectory, '../api-contract.live.json')
let response

try {
  response = await fetch(sourceUrl, { signal: AbortSignal.timeout(10_000) })
} catch (error) {
  const reason = error instanceof Error ? error.message : 'error desconocido'
  throw new Error(
    `No se pudo conectar con ${sourceUrl}: ${reason}. Verifica que el backend esté disponible.`,
  )
}

if (!response.ok) {
  throw new Error(
    `El backend respondió ${response.status} ${response.statusText} en ${sourceUrl}.`,
  )
}

const rawDocument = await response.text()
let apiDocument

try {
  apiDocument = JSON.parse(rawDocument)
} catch {
  throw new Error(`El backend no devolvió JSON válido en ${sourceUrl}.`)
}

if (
  typeof apiDocument !== 'object' ||
  apiDocument === null ||
  !('openapi' in apiDocument)
) {
  throw new Error(
    `El JSON de ${sourceUrl} no contiene el campo requerido "openapi".`,
  )
}

try {
  await writeFile(contractPath, rawDocument, { encoding: 'utf8', flag: 'wx' })
} catch (error) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'EEXIST'
  ) {
    throw new Error(
      `${contractPath} ya existe; no se sobrescribió. Muévelo o elimínalo antes de descargar otra copia.`,
    )
  }

  throw error
}

console.log(`Contrato remoto guardado sin modificar en ${contractPath}`)
