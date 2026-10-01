import { IconWhatsApp } from './icons';

const PHONE = '919905240717';
const DEFAULT_MESSAGE = 'Hi Nice Cards, I need help with my order.';

/**
 * Fixed WhatsApp click-to-chat button shown on every storefront screen.
 * Stays a compact circle on mobile and reveals a tooltip label on larger screens.
 */
const WhatsAppButton = ({ phone = PHONE, message = DEFAULT_MESSAGE }) => {
  const href = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <div className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-6">
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-50 motion-safe:animate-ping" />

      <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 sm:block dark:bg-slate-700">
        Chat with us on WhatsApp
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 ring-1 ring-black/5 transition-transform duration-200 hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 active:scale-95 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
      >
        <IconWhatsApp size={28} className="sm:size-[24px] lg:size-[28px]" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
