/**
 * payButtonLabelOverride — agnostic seam for plugins to override the
 * checkout "Pay $XX.YY" button label with their own representation.
 *
 * The token-payment plugin's detail component (``TokenCheckoutQuote``)
 * sets this to ``"Pay 800 tokens"`` once the live quote arrives so the
 * button reflects what the user is actually about to spend. When the
 * component unmounts (the user switches to a different method) the
 * override clears, and the host falls back to its default money-formatted
 * label.
 *
 * A module-level Vue ``Ref`` (cheaper than a Pinia store for a single
 * cross-component flag, and naturally cleared when the contributing
 * component unmounts).
 */
import { type Ref } from 'vue';
/** Reactive ref the host checkout view reads in its Pay button template. */
export declare const payButtonLabelOverride: Ref<string | null>;
/** Plugin detail components call this when their state changes. */
export declare function setPayButtonLabelOverride(label: string | null): void;
//# sourceMappingURL=payButtonLabelOverride.d.ts.map