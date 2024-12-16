
export function useMemcHook() {

  const formatMEMCValue = (value: string) => parseFloat(value.replace(',','') as string)

  return {
    formatMEMCValue
  }
}