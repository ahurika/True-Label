import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button, NumberPlate, StatusLabel } from '../ui';
import { VerdictSlip } from '../verdict';
import { Caveat } from '../feedback';
import { LedgerIcon, BellIcon, FlagIcon, MagnifierQuestionIcon } from '../icons';
import {
  SachetWaterIllustration,
  TomatoPasteTinIllustration,
  BottleIllustration,
  CartonIllustration,
  ToothpasteTubeIllustration,
  CreamJarIllustration,
  NoodlePackIllustration,
  BlisterStripIllustration,
  PackCaptureIllustration,
  EmptyHistoryIllustration,
  OfflineIllustration,
  ReadingIllustration,
  MedicineLabelIllustration,
} from '../illustrations';

describe('TrueLabel Design System Components', () => {
  it('renders NumberPlate with code formatting and label', () => {
    render(<NumberPlate value="A0-0000" label="NAFDAC Reg No" />);
    expect(screen.getByText('A0-0000')).toBeDefined();
    expect(screen.getByText('NAFDAC Reg No')).toBeDefined();
  });

  it('renders Button with primary variant', () => {
    render(<Button variant="primary">Scan a pack</Button>);
    const btn = screen.getByRole('button', { name: 'Scan a pack' });
    expect(btn.className).toContain('tl-btn-primary');
  });

  it('renders VerdictSlip for Registered and matches with mandatory caveat', () => {
    render(
      <VerdictSlip
        verdict="registered"
        title="Registered and matches"
        body="Pack matches registry record."
      />
    );
    expect(screen.getByText('Registered and matches')).toBeDefined();
    expect(screen.getByText(/A registered number can appear on a copied or counterfeit pack/)).toBeDefined();
  });

  it('renders StatusLabel with correct data-status attribute', () => {
    render(<StatusLabel status="confirmed">Confirmed</StatusLabel>);
    const label = screen.getByText('Confirmed');
    expect(label.getAttribute('data-status')).toBe('confirmed');
  });

  it('renders Caveat with exact PRD text', () => {
    render(<Caveat />);
    expect(
      screen.getByText(
        'A registered number can appear on a copied or counterfeit pack. This check compares available records and does not authenticate the physical contents or prove safety.'
      )
    ).toBeDefined();
  });

  it('renders all four verdict icons correctly', () => {
    const { container: c1 } = render(<LedgerIcon />);
    const { container: c2 } = render(<BellIcon />);
    const { container: c3 } = render(<FlagIcon />);
    const { container: c4 } = render(<MagnifierQuestionIcon />);

    expect(c1.querySelector('svg')).toBeDefined();
    expect(c2.querySelector('svg')).toBeDefined();
    expect(c3.querySelector('svg')).toBeDefined();
    expect(c4.querySelector('svg')).toBeDefined();
  });

  it('renders all eight product-pack illustrations correctly', () => {
    const illustrations = [
      <SachetWaterIllustration key="1" />,
      <TomatoPasteTinIllustration key="2" />,
      <BottleIllustration key="3" />,
      <CartonIllustration key="4" />,
      <ToothpasteTubeIllustration key="5" />,
      <CreamJarIllustration key="6" />,
      <NoodlePackIllustration key="7" />,
      <BlisterStripIllustration key="8" />,
    ];

    illustrations.forEach((ill) => {
      const { container } = render(ill);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('renders all five supporting illustrations correctly', () => {
    const supporting = [
      <PackCaptureIllustration key="1" />,
      <EmptyHistoryIllustration key="2" />,
      <OfflineIllustration key="3" />,
      <ReadingIllustration key="4" />,
      <MedicineLabelIllustration key="5" />,
    ];

    supporting.forEach((ill) => {
      const { container } = render(ill);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
