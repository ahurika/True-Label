import { describe, it, expect } from 'vitest';
import { MAIN_NAVIGATION, isNavigationActive, NavigationItem } from '../navigation';

describe('Central Dynamic Navigation System (PRD v4.0)', () => {
  it('defines the core navigation items for desktop and mobile', () => {
    expect(MAIN_NAVIGATION.length).toBeGreaterThanOrEqual(4);
    const ids = MAIN_NAVIGATION.map((item) => item.id);
    expect(ids).toContain('nav-home');
    expect(ids).toContain('nav-scan');
    expect(ids).toContain('nav-how-it-works');
    expect(ids).toContain('nav-help');
  });

  it('matches exact route for home', () => {
    const homeItem = MAIN_NAVIGATION.find((item) => item.id === 'nav-home') as NavigationItem;
    expect(isNavigationActive('/', homeItem)).toBe(true);
    expect(isNavigationActive('/scan', homeItem)).toBe(false);
    expect(isNavigationActive('/help', homeItem)).toBe(false);
  });

  it('matches scan route prefix including review and result flows', () => {
    const scanItem = MAIN_NAVIGATION.find((item) => item.id === 'nav-scan') as NavigationItem;
    expect(isNavigationActive('/scan', scanItem)).toBe(true);
    expect(isNavigationActive('/scan/capture', scanItem)).toBe(true);
    expect(isNavigationActive('/scan/reading', scanItem)).toBe(true);
    expect(isNavigationActive('/review', scanItem)).toBe(true);
    expect(isNavigationActive('/review/confirm', scanItem)).toBe(true);
    expect(isNavigationActive('/review/medicine', scanItem)).toBe(true);
    expect(isNavigationActive('/result', scanItem)).toBe(true);
    expect(isNavigationActive('/result/alert', scanItem)).toBe(true);
    expect(isNavigationActive('/help', scanItem)).toBe(false);
  });

  it('matches how-it-works route prefix', () => {
    const howItem = MAIN_NAVIGATION.find((item) => item.id === 'nav-how-it-works') as NavigationItem;
    expect(isNavigationActive('/how-it-works', howItem)).toBe(true);
    expect(isNavigationActive('/scan', howItem)).toBe(false);
  });

  it('matches help route prefix', () => {
    const helpItem = MAIN_NAVIGATION.find((item) => item.id === 'nav-help') as NavigationItem;
    expect(isNavigationActive('/help', helpItem)).toBe(true);
    expect(isNavigationActive('/', helpItem)).toBe(false);
  });
});
