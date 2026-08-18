import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { AppProvider } from '@/app/provider';
import { WelcomeOnboardingDialog } from '@/features/onboarding/components/welcome-onboarding-dialog';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <WelcomeOnboardingDialog />
    </AppProvider>
  );
};

export default App;
