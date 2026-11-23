import React from 'react';
import { Header, HeaderProps } from './Header';
import { BottomNav } from './BottomNav';
import { PageContainer } from './PageContainer';

export interface AppShellProps {
  headerProps?: HeaderProps;
  hideNav?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  headerProps,
  hideNav = false,
  children,
}) => {
  return (
    <div className="tl-app-shell">
      <Header {...headerProps} />
      <main className="tl-app-main">
        <PageContainer>
          {children}
        </PageContainer>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
