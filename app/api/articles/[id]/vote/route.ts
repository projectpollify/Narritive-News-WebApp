import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id
    const body = await request.json()
    const { type } = body

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, we would save this to the database (Prisma)
    // await prisma.article.update({ ... })

    console.log(`[Mock Backend] Vote received for article ${id}: ${type}`)

    // Return success
    return NextResponse.json({
        success: true,
        articleId: id,
        voteType: type,
        newCounts: {
            up: type === 'up' ? 125 : 124, // Mock incremented values
            down: type === 'down' ? 13 : 12
        }
    })
}
