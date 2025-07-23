import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import TurndownService from 'turndown'
import type { RetroRoom, ExportFormat } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  const format = searchParams.get('format') as ExportFormat['type'] || 'json'

  if (!roomId) {
    return NextResponse.json(
      { error: 'Room ID is required' },
      { status: 400 }
    )
  }

  try {
    // In a real implementation, you would fetch room data from Redis
    // For now, we'll return a mock response
    const roomData: RetroRoom = {
      id: roomId,
      name: `Room ${roomId}`,
      phase: 'ideation',
      facilitatorId: 'facilitator-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: [],
      votes: [],
      users: [],
      polls: [],
      pollVotes: [],
      settings: {
        allowAnonymousCards: true,
        allowVoting: true,
        allowReactions: true,
        lockedColumns: [],
        phaseDuration: 10
      }
    }

    switch (format) {
      case 'json':
        return NextResponse.json(roomData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="retro-${roomId}.json"`
          }
        })

      case 'pdf':
        const pdf = new jsPDF()
        pdf.setFontSize(20)
        pdf.text(`Retrospective Report - ${roomData.name}`, 20, 20)
        
        pdf.setFontSize(12)
        pdf.text(`Room ID: ${roomData.id}`, 20, 40)
        pdf.text(`Phase: ${roomData.phase}`, 20, 50)
        pdf.text(`Created: ${roomData.createdAt.toLocaleDateString()}`, 20, 60)
        pdf.text(`Total Cards: ${roomData.cards.length}`, 20, 70)
        pdf.text(`Total Votes: ${roomData.votes.length}`, 20, 80)
        pdf.text(`Participants: ${roomData.users.length}`, 20, 90)

        const pdfBuffer = pdf.output('arraybuffer')
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="retro-${roomId}.pdf"`
          }
        })

      case 'markdown':
        const turndownService = new TurndownService()
        
        let markdown = `# Retrospective Report - ${roomData.name}\n\n`
        markdown += `**Room ID:** ${roomData.id}\n`
        markdown += `**Phase:** ${roomData.phase}\n`
        markdown += `**Created:** ${roomData.createdAt.toLocaleDateString()}\n`
        markdown += `**Total Cards:** ${roomData.cards.length}\n`
        markdown += `**Total Votes:** ${roomData.votes.length}\n`
        markdown += `**Participants:** ${roomData.users.length}\n\n`

        // Group cards by column
        const cardsByColumn = roomData.cards.reduce((acc, card) => {
          if (!acc[card.column]) {
            acc[card.column] = []
          }
          acc[card.column].push(card)
          return acc
        }, {} as Record<string, typeof roomData.cards>)

        Object.entries(cardsByColumn).forEach(([column, cards]) => {
          markdown += `## ${column.charAt(0).toUpperCase() + column.slice(1)}\n\n`
          cards.forEach(card => {
            markdown += `- ${card.content} (${card.votes} votes)\n`
          })
          markdown += '\n'
        })

        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="retro-${roomId}.md"`
          }
        })

      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
} 