import { OGCollect } from 'ogateway';

const PUBLIC_KEY = import.meta.env.VITE_OGATEWAY_PUBLIC_KEY ?? '';
const API_BASE_URL = import.meta.env.VITE_OGATEWAY_API_URL ?? '';

export default function App() {
  return (
    <main style={{ maxWidth: 420, margin: '48px auto', fontFamily: 'sans-serif' }}>
      <h1>OG Collect demo</h1>
      <p>Collecting GHS 5.00 via mobile money, through a single component.</p>
      <OGCollect
        publicKey={PUBLIC_KEY}
        apiBaseUrl={API_BASE_URL}
        amount={5}
        currency="GHS"
        reason="Demo payment"
        onSuccess={(transaction) => console.log('success', transaction)}
        onFailed={(transaction, error) => console.log('failed', transaction, error)}
      />
    </main>
  );
}
