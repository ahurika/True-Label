import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  VERDICT_DEFINITIONS,
  VERDICTS_BY_CODE,
  getVerdictTitle,
  requiresCopiedNumberCaveat,
} from '@/domain/verdict-types';
import { VerdictSlip, VerdictIcon } from '../verdict';
import enMessages from '@/messages/en.json';
import pcmMessages from '@/messages/pcm.json';

describe('Authoritative Verdict Definitions (PRD v3.1 & Design System)', () => {
  it('strictly maps Verdict 1 to "Registered and matches"', () => {
    const v1 = VERDICT_DEFINITIONS[1];
    expect(v1.number).toBe(1);
    expect(v1.code).toBe('registered');
    expect(v1.title).toBe('Registered and matches');
    expect(v1.iconName).toBe('Ledger');
    expect(v1.mandatoryCaveat).toBe(true);
    expect(getVerdictTitle(1)).toBe('Registered and matches');
    expect(getVerdictTitle('registered')).toBe('Registered and matches');
    expect(requiresCopiedNumberCaveat(1)).toBe(true);
  });

  it('strictly maps Verdict 2 to "Matches a NAFDAC alert"', () => {
    const v2 = VERDICT_DEFINITIONS[2];
    expect(v2.number).toBe(2);
    expect(v2.code).toBe('alert');
    expect(v2.title).toBe('Matches a NAFDAC alert');
    expect(v2.iconName).toBe('Bell');
    expect(v2.mandatoryCaveat).toBe(false);
    expect(getVerdictTitle(2)).toBe('Matches a NAFDAC alert');
    expect(getVerdictTitle('alert')).toBe('Matches a NAFDAC alert');
    expect(requiresCopiedNumberCaveat(2)).toBe(false);
  });

  it('strictly maps Verdict 3 to "Number problem"', () => {
    const v3 = VERDICT_DEFINITIONS[3];
    expect(v3.number).toBe(3);
    expect(v3.code).toBe('number-problem');
    expect(v3.title).toBe('Number problem');
    expect(v3.iconName).toBe('Flag');
    expect(v3.mandatoryCaveat).toBe(false);
    expect(getVerdictTitle(3)).toBe('Number problem');
    expect(getVerdictTitle('number-problem')).toBe('Number problem');
    expect(requiresCopiedNumberCaveat(3)).toBe(false);
  });

  it('strictly maps Verdict 4 to "Could not confirm"', () => {
    const v4 = VERDICT_DEFINITIONS[4];
    expect(v4.number).toBe(4);
    expect(v4.code).toBe('unconfirmed');
    expect(v4.title).toBe('Could not confirm');
    expect(v4.iconName).toBe('MagnifierQuestion');
    expect(v4.mandatoryCaveat).toBe(false);
    expect(getVerdictTitle(4)).toBe('Could not confirm');
    expect(getVerdictTitle('unconfirmed')).toBe('Could not confirm');
    expect(requiresCopiedNumberCaveat(4)).toBe(false);
  });

  it('verifies exact message dictionary values for English (en)', () => {
    expect(enMessages.verdict.verdict1).toBe('Registered and matches');
    expect(enMessages.verdict.verdict2).toBe('Matches a NAFDAC alert');
    expect(enMessages.verdict.verdict3).toBe('Number problem');
    expect(enMessages.verdict.verdict4).toBe('Could not confirm');

    expect(enMessages.verdict.status1).toBe('Registered and matches');
    expect(enMessages.verdict.status2).toBe('Matches a NAFDAC alert');
    expect(enMessages.verdict.status3).toBe('Number problem');
    expect(enMessages.verdict.status4).toBe('Could not confirm');
  });

  it('verifies exact message dictionary values for Nigerian Pidgin (pcm)', () => {
    expect(pcmMessages.verdict.verdict1).toBe('Registered and matches');
    expect(pcmMessages.verdict.verdict2).toBe('Matches a NAFDAC alert');
    expect(pcmMessages.verdict.verdict3).toBe('Number problem');
    expect(pcmMessages.verdict.verdict4).toBe('Could not confirm');

    expect(pcmMessages.verdict.status1).toBe('Registered and matches');
    expect(pcmMessages.verdict.status2).toBe('Matches a NAFDAC alert');
    expect(pcmMessages.verdict.status3).toBe('Number problem');
    expect(pcmMessages.verdict.status4).toBe('Could not confirm');
  });

  it('allows lookup by code across all four verdicts', () => {
    expect(VERDICTS_BY_CODE.registered?.number).toBe(1);
    expect(VERDICTS_BY_CODE.alert?.number).toBe(2);
    expect(VERDICTS_BY_CODE['number-problem']?.number).toBe(3);
    expect(VERDICTS_BY_CODE.unconfirmed?.number).toBe(4);
  });

  it('renders VerdictIcon correctly for all four verdicts', () => {
    const { container: c1 } = render(<VerdictIcon verdict="registered" />);
    const { container: c2 } = render(<VerdictIcon verdict="alert" />);
    const { container: c3 } = render(<VerdictIcon verdict="number-problem" />);
    const { container: c4 } = render(<VerdictIcon verdict="unconfirmed" />);

    expect(c1.querySelector('svg')).toBeDefined();
    expect(c2.querySelector('svg')).toBeDefined();
    expect(c3.querySelector('svg')).toBeDefined();
    expect(c4.querySelector('svg')).toBeDefined();
  });

  it('renders VerdictSlip for Verdict 1 with mandatory caveat', () => {
    render(<VerdictSlip verdict="registered" verdictNumber={1} />);
    expect(screen.getByText('Registered and matches')).toBeDefined();
    expect(screen.getByText(/A registered number can appear on a copied or counterfeit pack/)).toBeDefined();
  });

  it('renders VerdictSlip for Verdict 2 without caveat', () => {
    render(<VerdictSlip verdict="alert" verdictNumber={2} />);
    expect(screen.getByText('Matches a NAFDAC alert')).toBeDefined();
    expect(screen.queryByText(/A registered number can appear on a copied or counterfeit pack/)).toBeNull();
  });

  it('renders VerdictSlip for Verdict 3 without caveat', () => {
    render(<VerdictSlip verdict="number-problem" verdictNumber={3} />);
    expect(screen.getByText('Number problem')).toBeDefined();
    expect(screen.queryByText(/A registered number can appear on a copied or counterfeit pack/)).toBeNull();
  });

  it('renders VerdictSlip for Verdict 4 without caveat', () => {
    render(<VerdictSlip verdict="unconfirmed" verdictNumber={4} />);
    expect(screen.getByText('Could not confirm')).toBeDefined();
    expect(screen.queryByText(/A registered number can appear on a copied or counterfeit pack/)).toBeNull();
  });
});
