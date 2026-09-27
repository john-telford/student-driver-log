/**
 * The brand's identity marks. There is no formal logo in the source: the product signs itself
 * with the uppercase wordmark, plus a steering-wheel glyph (favicon / OG image) and the
 * Illinois route shield used on the login sign.
 * @startingPoint section="Brand" subtitle="Wordmark, wheel glyph and route shield" viewport="700x160"
 */
export interface BrandMarkProps {
  variant?: 'wordmark' | 'wheel' | 'shield';
  /** Font size for the wordmark, px box for the glyphs */
  size?: number;
  color?: string;
  /** Relative path to the design system's assets/ folder, for the shield image */
  assetBase?: string;
}
export declare function BrandMark(props: BrandMarkProps): JSX.Element;
