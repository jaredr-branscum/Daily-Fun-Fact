export interface FunFactProps {
    fact: string
    date: string
    topic: string
    category?: string
    tags?: string[]
    didYouKnow?: string
    references: { title: string; url: string }[]
    placeholder?: boolean
}
