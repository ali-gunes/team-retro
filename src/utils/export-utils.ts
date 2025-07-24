import jsPDF from 'jspdf'
import type { RetroRoom, Card, Poll, PollVote } from '@/types'

interface ExportOptions {
  type: 'actions' | 'summary' | 'polls'
  room: RetroRoom
}

// Utility function to handle Turkish characters
function encodeTurkishText(text: string): string {
  // Replace Turkish characters with their closest ASCII equivalents for better PDF compatibility
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  }
  
  return text.split('').map(char => turkishMap[char] || char).join('')
}

export function exportToPDF(options: ExportOptions) {
  const { type, room } = options
  const doc = new jsPDF()
  
  // Set up fonts and styling - use a font that supports Turkish characters
  // Try to use a font that supports Turkish characters better
  try {
    // Add a font that supports Turkish characters
    doc.setFont('helvetica')
  } catch (error) {
    // Fallback to default font
    console.warn('Could not set custom font, using default')
  }
  doc.setFontSize(20)
  
  // Add header
  doc.setTextColor(44, 62, 80)
  doc.text('Team Retro - Retrospektif Raporu', 20, 30)
  
  // Add room info
  doc.setFontSize(12)
  doc.setTextColor(52, 73, 94)
  doc.text(`Oda: ${encodeTurkishText(room.name)}`, 20, 45)
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 55)
  doc.text(`Katılımcı Sayısı: ${room.users.length}`, 20, 65)
  
  let yPosition = 85
  
  switch (type) {
    case 'actions':
      exportActionsOnly(doc, room, yPosition)
      break
    case 'summary':
      exportFullSummary(doc, room, yPosition)
      break
    case 'polls':
      exportPollResults(doc, room, yPosition)
      break
  }
  
  // Save the PDF
  const fileName = `team-retro-${encodeTurkishText(room.name)}-${type}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

function exportActionsOnly(doc: jsPDF, room: RetroRoom, startY: number) {
  doc.setFontSize(16)
  doc.setTextColor(44, 62, 80)
  doc.text('Aksiyon Maddeleri', 20, startY)
  
  const actionCards = room.cards.filter(card => card.column === 'action')
  
  if (actionCards.length === 0) {
    doc.setFontSize(12)
    doc.setTextColor(149, 165, 166)
    doc.text('Henüz aksiyon maddesi eklenmemiş.', 20, startY + 20)
    return
  }
  
  let yPos = startY + 20
  
  actionCards.forEach((card, index) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }
    
    doc.setFontSize(12)
    doc.setTextColor(52, 73, 94)
    doc.text(`${index + 1}. ${encodeTurkishText(card.content)}`, 20, yPos)
    
    doc.setFontSize(10)
    doc.setTextColor(149, 165, 166)
    doc.text(`Oylar: ${card.votes} | Ekleyen: ${encodeTurkishText(card.authorName)}`, 25, yPos + 8)
    
    yPos += 20
  })
}

function exportFullSummary(doc: jsPDF, room: RetroRoom, startY: number) {
  const columns = [
    { key: 'start', title: 'Devam', icon: '🚀' },
    { key: 'stop', title: 'Bırak', icon: '🛑' },
    { key: 'action', title: 'Aksiyon', icon: '⚡' }
  ]
  
  let yPos = startY
  
  columns.forEach(column => {
    const cards = room.cards.filter(card => card.column === column.key)
    
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }
    
    doc.setFontSize(14)
    doc.setTextColor(44, 62, 80)
    doc.text(`${column.icon} ${column.title}`, 20, yPos)
    
    yPos += 15
    
    if (cards.length === 0) {
      doc.setFontSize(10)
      doc.setTextColor(149, 165, 166)
      doc.text('Henüz kart eklenmemiş.', 25, yPos)
      yPos += 15
    } else {
      cards.forEach((card, index) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 30
        }
        
        doc.setFontSize(10)
        doc.setTextColor(52, 73, 94)
        doc.text(`• ${encodeTurkishText(card.content)}`, 25, yPos)
        
        doc.setFontSize(8)
        doc.setTextColor(149, 165, 166)
        doc.text(`Oylar: ${card.votes} | Ekleyen: ${encodeTurkishText(card.authorName)}`, 30, yPos + 6)
        
        yPos += 15
      })
    }
    
    yPos += 10
  })
  
  // Add poll results if available
  if (room.polls && room.polls.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }
    
    doc.setFontSize(14)
    doc.setTextColor(44, 62, 80)
    doc.text('📊 Anket Sonuçları', 20, yPos)
    
    yPos += 15
    
    room.polls.forEach((poll, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }
      
      doc.setFontSize(10)
      doc.setTextColor(52, 73, 94)
      doc.text(`${index + 1}. ${encodeTurkishText(poll.question)}`, 25, yPos)
      
      const pollVotes = room.pollVotes.filter(vote => vote.pollId === `poll-${index}`)
      const totalVotes = pollVotes.length
      
      doc.setFontSize(8)
      doc.setTextColor(149, 165, 166)
      doc.text(`Toplam Oy: ${totalVotes}`, 30, yPos + 8)
      
      // Add detailed poll results based on type
      switch (poll.type) {
        case 'yes_no':
          const yesVotes = pollVotes.filter(vote => vote.value === 'yes').length
          const noVotes = pollVotes.filter(vote => vote.value === 'no').length
          doc.text(`Evet: ${yesVotes} | Hayır: ${noVotes}`, 30, yPos + 16)
          break
        case 'scale_1_5':
          const scaleVotes = pollVotes.map(vote => parseInt(vote.value.toString()))
          const average = scaleVotes.length > 0 ? (scaleVotes.reduce((a, b) => a + b, 0) / scaleVotes.length).toFixed(1) : '0'
          doc.text(`Ortalama: ${average}/5`, 30, yPos + 16)
          break
        case 'multiple_choice':
          if (poll.options) {
            poll.options.forEach((option, optIndex) => {
              const optionVotes = pollVotes.filter(vote => vote.value === option).length
              doc.text(`${encodeTurkishText(option)}: ${optionVotes} oy`, 30, yPos + 16 + (optIndex * 8))
            })
          }
          break
        case 'emoji_scale':
          const emojiVotes = pollVotes.map(vote => vote.value.toString())
          const emojiCounts = emojiVotes.reduce((acc, emoji) => {
            acc[emoji] = (acc[emoji] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          Object.entries(emojiCounts).forEach(([emoji, count], emojiIndex) => {
            doc.text(`${emoji}: ${count}`, 30, yPos + 16 + (emojiIndex * 8))
          })
          break
      }
      
      yPos += 35
    })
  }
}

function exportPollResults(doc: jsPDF, room: RetroRoom, startY: number) {
  if (!room.polls || room.polls.length === 0) {
    doc.setFontSize(12)
    doc.setTextColor(149, 165, 166)
    doc.text('Bu odada anket bulunmuyor.', 20, startY)
    return
  }
  
  doc.setFontSize(16)
  doc.setTextColor(44, 62, 80)
  doc.text('Anket Sonuçları', 20, startY)
  
  let yPos = startY + 20
  
  room.polls.forEach((poll, index) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }
    
    doc.setFontSize(12)
    doc.setTextColor(52, 73, 94)
    doc.text(`${index + 1}. ${encodeTurkishText(poll.question)}`, 20, yPos)
    
    const pollVotes = room.pollVotes.filter(vote => vote.pollId === `poll-${index}`)
    const totalVotes = pollVotes.length
    
    doc.setFontSize(10)
    doc.setTextColor(149, 165, 166)
    doc.text(`Toplam Oy: ${totalVotes}`, 25, yPos + 10)
    
    // Add poll type specific results
    switch (poll.type) {
      case 'yes_no':
        const yesVotes = pollVotes.filter(vote => vote.value === 'yes').length
        const noVotes = pollVotes.filter(vote => vote.value === 'no').length
        doc.text(`Evet: ${yesVotes} | Hayır: ${noVotes}`, 25, yPos + 18)
        break
      case 'scale_1_5':
        const scaleVotes = pollVotes.map(vote => parseInt(vote.value.toString()))
        const average = scaleVotes.length > 0 ? (scaleVotes.reduce((a, b) => a + b, 0) / scaleVotes.length).toFixed(1) : '0'
        doc.text(`Ortalama: ${average}/5`, 25, yPos + 18)
        break
      case 'multiple_choice':
        if (poll.options) {
          poll.options.forEach((option, optIndex) => {
            const optionVotes = pollVotes.filter(vote => vote.value === option).length
            doc.text(`${encodeTurkishText(option)}: ${optionVotes} oy`, 25, yPos + 18 + (optIndex * 8))
          })
        }
        break
      case 'emoji_scale':
        const emojiVotes = pollVotes.map(vote => vote.value.toString())
        const emojiCounts = emojiVotes.reduce((acc, emoji) => {
          acc[emoji] = (acc[emoji] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        Object.entries(emojiCounts).forEach(([emoji, count], emojiIndex) => {
          doc.text(`${emoji}: ${count}`, 25, yPos + 18 + (emojiIndex * 8))
        })
        break
    }
    
    yPos += 40
  })
} 