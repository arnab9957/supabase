"use client"
import React from "react"

interface BlockData {
    level?: number
    text?: string
    style?: string
    items?: string[]
    code?: string
    url?: string
    caption?: string
    file?: {
        url: string
    }
}

interface Block {
    type: string
    data: BlockData
}

interface Content {
    blocks: Block[]
}

interface BlogContentProps {
    content: Content
}

export function BlogContent({ content }: BlogContentProps) {
    if (!content || !content.blocks) {
        return <p>No content available </p>
    }

    return (
        <div className="space-y-4" >
            {
                content.blocks.map((block: Block, index: number) => {
                    switch (block.type) {
                        case "header":
                            const level = block.data.level || 2
                            return React.createElement(`h${level}`, { key: index, className: "font-bold mt-6 mb-3" }, block.data.text)

                        case "paragraph":
                            return (
                                <p key={index} className="leading-relaxed text-zinc-700 dark:text-zinc-300" >
                                    {block.data.text}
                                </p>
                            )

                        case "list":
                            if (block.data.style === "ordered") {
                                return (
                                    <ol key={index} className="list-decimal list-inside space-y-2 ml-4" >
                                        {
                                            block.data.items?.map((item: string, i: number) => (
                                                <li key={i} > {item} </li>
                                            ))
                                        }
                                    </ol>
                                )
                            }
                            return (
                                <ul key={index} className="list-disc list-inside space-y-2 ml-4" >
                                    {
                                        block.data.items?.map((item: string, i: number) => (
                                            <li key={i} > {item} </li>
                                        ))
                                    }
                                </ul>
                            )

                        case "quote":
                            return (
                                <blockquote key={index} className="border-l-4 border-emerald-600 pl-4 italic text-zinc-400 my-4" >
                                    {block.data.text}
                                </blockquote>
                            )

                        case "code":
                            return (
                                <pre key={index} className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded overflow-x-auto text-sm" >
                                    <code>{block.data.code} </code>
                                </pre>
                            )

                        case "image":
                            const imageUrl = block.data.file?.url || block.data.url
                            if (!imageUrl) return null
                            return (
                                <div key={index} className="my-6" >
                                    <img
                                        src={imageUrl}
                                        alt={block.data.caption || "Blog image"}
                                        className="max-w-full h-auto rounded"
                                    />
                                    {block.data.caption && <p className="text-sm text-zinc-400 mt-2 text-center"> {block.data.caption} </p>}
                                </div>
                            )

                        default:
                            return null
                    }
                })}
        </div>
    )
}
