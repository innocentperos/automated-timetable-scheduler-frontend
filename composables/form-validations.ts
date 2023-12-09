export const useRuleRequired = (value: string) => !!value || "Field is required"

export const useRuleMaxLength = (length: number) => (value: string) => {
    return value.length <= length || `Must be less than ${length} characters.`
}

export const useRuleMinLength = (length: number) => (value: string) => {
    return value.length >= length || `Must be more than ${length} characters.`
}

export const useRuleNumber = (value: string) => {
    const p = parseInt(value)
    if (isNaN(p) || p.toString() != value.trim()) return "Most be a valid number"

    return true
}
