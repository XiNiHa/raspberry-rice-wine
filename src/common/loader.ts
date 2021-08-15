import type { Script } from './script'

export function loadScript (options: {
    input: string;
    pattern: string;
    mappings: Record<number, string>;
    lines?: number;
  }): Script[] {
  const { input, pattern, mappings, lines } = options

  const regex = new RegExp(pattern)
  const rows = input.split('\n')
  let combined: string[] = []
  const result: Script[] = []

  if (lines) {
    for (let i = 0; i < rows.length; i += lines) {
      combined.push(...rows.slice(i, i + lines))
    }
  } else {
    combined = rows
  }

  for (const part of combined) {
    const match = regex.exec(part)
    if (match) {
      const script: Script = {
        fields: [],
        mappings: {}
      }

      for (let i = 1; i < match.length; i++) {
        if (mappings[i] != null) {
          script.fields.push({
            name: mappings[i],
            value: match[i]
          })
        }
      }

      result.push(script)
    }
  }

  return result
}
