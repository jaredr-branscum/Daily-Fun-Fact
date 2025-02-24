'use client'

import React from 'react'
import { useState } from 'react'
import { Calendar, Tag, Book, Info } from 'lucide-react'
import { FunFactProps } from '@/types/FunFact'

const FunFactCard: React.FC<FunFactProps> = ({ fact, date, topic, category, tags, didYouKnow, references }) => {
    const [showReferences, setShowReferences] = useState(false)
    return (
        <div className="card-container">
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="topic-badge">{topic}</span>
                {category && <span className="category-badge">{category}</span>}
            </div>
            <p className="fact-text">{fact}</p>
            {didYouKnow && (
                <div className="did-you-know-banner">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">{didYouKnow}</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="date-container">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{date}</span>
            </div>
            {tags && tags.length > 0 && (
                <div className="tags-container">
                    <Tag className="h-4 w-4 text-gray-400" />
                    {tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            {references && references.length > 0 && (
                <div className="references-container">
                    <button onClick={() => setShowReferences(!showReferences)} className="references-button">
                        <Book className="mr-2 h-4 w-4" />
                        {showReferences ? 'Hide References' : 'Show References'}
                    </button>
                    {showReferences && (
                        <div className="references-list">
                            <h3 className="font-semibold mb-2 text-black">References:</h3>
                            <ul className="list-disc pl-5">
                                {references.map((ref, index) => (
                                    <li key={index}>
                                        <a
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="reference-link"
                                        >
                                            {ref.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FunFactCard
