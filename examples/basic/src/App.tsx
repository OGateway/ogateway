import { OGCollect } from 'ogateway';
import logomark from './assets/logomark.svg';

const PUBLIC_KEY = import.meta.env.VITE_OGATEWAY_PUBLIC_KEY ?? '';
const API_BASE_URL = import.meta.env.VITE_OGATEWAY_API_URL ?? '';

const PRICE = 149;
const FEE = 0;

export default function App() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img src={logomark} alt="" width={22} height={22} />
          <span>OGateway</span>
        </div>
        <div className="mode-indicator">
          <span className="dot" />
          Test mode
        </div>
      </header>

      <main>
        <div className="checkout">
          <section className="product">
            <div className="product-thumb">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 13v-1a8 8 0 0116 0v1M4 13a2 2 0 00-2 2v2a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H4zm16 0a2 2 0 012 2v2a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h1z"
                  stroke="#003a39"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="product-info">
              <div className="product-name">Wireless Earbuds Pro</div>
              <div className="product-desc">Active noise cancelling · 30h battery</div>
            </div>
            <dl className="price-breakdown">
              <div>
                <dt>Subtotal</dt>
                <dd>GH₵{PRICE.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Processing fee</dt>
                <dd>GH₵{FEE.toFixed(2)}</dd>
              </div>
              <div className="total">
                <dt>Total</dt>
                <dd>GH₵{(PRICE + FEE).toFixed(2)}</dd>
              </div>
            </dl>
          </section>

          <section className="widget">
            <OGCollect
              publicKey={PUBLIC_KEY}
              apiBaseUrl={API_BASE_URL}
              amount={PRICE}
              currency="GHS"
              reason="Wireless Earbuds Pro"
              onSuccess={transaction => console.log('success', transaction)}
              onFailed={(transaction, error) => console.log('failed', transaction, error)}
            />
          </section>
        </div>

        <section className="integration">
          <div className="integration-label">This checkout is one component</div>
          <pre className="snippet">{`<OGCollect
  publicKey="pk_test_..."
  apiBaseUrl="https://api.ogateway.co"
  amount={149}
  currency="GHS"
  reason="Wireless Earbuds Pro"
  onSuccess={(trx) => fulfillOrder(trx)}
/>`}</pre>
        </section>
      </main>
    </div>
  );
}
