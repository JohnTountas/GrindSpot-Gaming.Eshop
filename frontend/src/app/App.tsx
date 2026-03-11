/**
 * Root frontend application composition.
 */
import AppProviders from '@/app/providers/AppProviders';
import AppRouter from '@/app/router/AppRouter';

// Keeps provider setup and route wiring separated from the Vite entrypoint.
function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;
