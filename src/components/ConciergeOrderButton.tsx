import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { ChatCircleDots } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

export default function ConciergeOrderButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const isMobile = useIsMobile()

  const handleSendOrder = () => {
    if (!message.trim()) {
      toast.error('Please enter your order details')
      return
    }

    if (message.trim().length < 10) {
      toast.error('Please provide more details about your order')
      return
    }

    const phoneNumber = '971528355939'
    const formattedMessage = encodeURIComponent(
      `🛥️ Imperial Catering Concierge Order\n\n${message.trim()}\n\n---\nSent via Imperial Delicious Menu`
    )
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${formattedMessage}`
    
    window.open(whatsappUrl, '_blank')
    
    toast.success('Opening WhatsApp...')
    setMessage('')
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`${
          isMobile
            ? 'fixed bottom-6 left-4 right-4 w-auto z-40'
            : 'fixed bottom-8 left-1/2 -translate-x-1/2 z-40'
        } bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg font-heading tracking-wide text-base py-6 px-8`}
      >
        <ChatCircleDots size={24} weight="fill" className="mr-2" />
        Concierge Order
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Concierge Order</DialogTitle>
            <DialogDescription className="font-body">
              Describe your dining preferences, special requests, or any custom requirements. Our concierge will craft the perfect experience for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="concierge-message" className="font-body">
                Your Request
              </Label>
              <Textarea
                id="concierge-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I would like to order a tasting menu for 6 guests on Friday evening. We prefer seafood and have one vegetarian guest..."
                rows={8}
                className="resize-none font-body"
              />
              <p className="text-xs text-muted-foreground">
                {message.length} characters
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendOrder}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-heading"
            >
              <ChatCircleDots size={20} weight="fill" className="mr-2" />
              Send via WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="font-body"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
