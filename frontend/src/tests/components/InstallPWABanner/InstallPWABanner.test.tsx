import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, expect, test } from 'vitest';
import InstallPWABanner from '@/src/components/InstallPWABanner/InstallPWABanner';

// Mock usePWAInstall
vi.mock('@/src/hooks/usePWAInstall', () => ({
  usePWAInstall: vi.fn(),
}));

import { usePWAInstall } from '@/src/hooks/usePWAInstall';

const mockUsePWAInstall = vi.mocked(usePWAInstall);

describe('InstallPWABanner', () => {
  test('renders nothing when showInstallButton is false', () => {
    mockUsePWAInstall.mockReturnValue({
      install: vi.fn(),
      dismiss: vi.fn(),
      showInstallButton: false,
    });

    const { container } = render(<InstallPWABanner />);
    expect(container.firstChild).toBeNull();
  });

  test('renders banner when showInstallButton is true', () => {
    mockUsePWAInstall.mockReturnValue({
      install: vi.fn(),
      dismiss: vi.fn(),
      showInstallButton: true,
    });

    render(<InstallPWABanner />);

    expect(screen.getByText('Installer Sanger under Liljen som app')).toBeInTheDocument();

    expect(screen.getByText('Installer')).toBeInTheDocument();
    expect(screen.getByText('Ikke vis igjen')).toBeInTheDocument();
  });

  test('calls install when clicking install button', async () => {
    const user = userEvent.setup();
    const installMock = vi.fn();

    mockUsePWAInstall.mockReturnValue({
      install: installMock,
      dismiss: vi.fn(),
      showInstallButton: true,
    });

    render(<InstallPWABanner />);

    await user.click(screen.getByText('Installer'));

    expect(installMock).toHaveBeenCalled();
  });

  test('calls dismiss when clicking dismiss button', async () => {
    const user = userEvent.setup();
    const dismissMock = vi.fn();

    mockUsePWAInstall.mockReturnValue({
      install: vi.fn(),
      dismiss: dismissMock,
      showInstallButton: true,
    });

    render(<InstallPWABanner />);

    await user.click(screen.getByText('Ikke vis igjen'));

    expect(dismissMock).toHaveBeenCalled();
  });
});
