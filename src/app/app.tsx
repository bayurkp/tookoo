import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppProvider } from '@/app/provider';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
