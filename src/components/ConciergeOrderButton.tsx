import { useState } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { t } from '@/lib/i18n'
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
  const { language } = useLanguage()

  const handleSendOrder = () => {
    if (!message.trim()) {
      toast.error(t('concierge.enterDetails', language))
      return
    }

    if (message.trim().length < 10) {
      toast.error(t('concierge.provideDetails', language))
      return
    }

    const phoneNumber = '971528355939'
    const formattedMessage = encodeURIComponent(
      `🛥️ Imperial Catering ${t('concierge.conciergeOrder', language)}\n\n${message.trim()}\n\n---\nSent via Imperial Delicious Menu`
    )
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${formattedMessage}`
    
    window.open(whatsappUrl, '_blank')
    
    toast.success(t('concierge.openingWhatsapp', language))
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
        {t('concierge.orderNow', language)}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{t('concierge.placeOrder', language)}</DialogTitle>
            <DialogDescription className="font-body">
              {t('concierge.conciergeDescription', language)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="concierge-message" className="font-body">
                {t('concierge.yourRequest', language)}
              </Label>
              <Textarea
                id="concierge-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('concierge.placeholderLong', language)}
                rows={8}
                className="resize-none font-body"
              />
              <p className="text-xs text-muted-foreground">
                {t('concierge.charactersCount', language, { count: message.length.toString() })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendOrder}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-heading"
            >
              <ChatCircleDots size={20} weight="fill" className="mr-2" />
              {t('concierge.placeOrder', language)}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="font-body"
            >
              {t('common.cancel', language)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
