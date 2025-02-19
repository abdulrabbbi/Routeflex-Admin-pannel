import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css'

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
// import ErrorBoundary from './utils/ErrorHandling';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    {/* <ErrorBoundary> */}

      {/* <QueryClientProvider client={queryClient}> */}
        <div className='bg-TWSiteBackground'>
          <App />
        </div>
        <Toaster />
      {/* </QueryClientProvider> */}
    {/* </ErrorBoundary> */}
  </React.StrictMode>
);
