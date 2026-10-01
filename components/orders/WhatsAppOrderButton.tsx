import { buttonClasses } from "@/components/ui/Button";
import { ChatIcon } from "@/components/ui/icons";
import { getOrderWhatsAppUrl } from "@/lib/checkout/whatsapp";
import type { Order } from "@/types";

interface WhatsAppOrderButtonProps {
  order: Order;
}

/** Opens WhatsApp with the order details ready to send to the delivery phone number. */
export function WhatsAppOrderButton({ order }: WhatsAppOrderButtonProps) {
  return (
    <a
      href={getOrderWhatsAppUrl(order)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses({ variant: "whatsapp", size: "lg", fullWidth: true })}
    >
      <ChatIcon className="size-5 shrink-0" />
      <span>
        Get order details on WhatsApp
        <span className="sr-only"> (opens WhatsApp)</span>
      </span>
    </a>
  );
}
