import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { siteConfig } from '@/config/site';

describe('Technical SEO & Discoverability Architecture (PRD v4.0 §15)', () => {
  it('generates XML sitemap for public indexable routes only', () => {
    const items = sitemap();
    expect(items.length).toBeGreaterThanOrEqual(5);

    const urls = items.map((i) => i.url);
    const baseUrl = siteConfig.url.replace(/\/+$/, '');

    expect(urls).toContain(`${baseUrl}/`);
    expect(urls).toContain(`${baseUrl}/how-it-works`);
    expect(urls).toContain(`${baseUrl}/about`);
    expect(urls).toContain(`${baseUrl}/reference`);
    expect(urls).toContain(`${baseUrl}/help`);
    expect(urls).toContain(`${baseUrl}/privacy`);
    expect(urls).toContain(`${baseUrl}/terms`);
    expect(urls).toContain(`${baseUrl}/offline`);
    expect(urls).toContain(`${baseUrl}/unavailable`);

    // Verify private routes are NOT in sitemap
    urls.forEach((u) => {
      expect(u).not.toContain('/scan');
      expect(u).not.toContain('/review');
      expect(u).not.toContain('/result');
      expect(u).not.toContain('/shares');
      expect(u).not.toContain('/history');
      expect(u).not.toContain('/api');
    });
  });

  it('generates robots.txt with strict private route disallow rules', () => {
    const rules = robots();
    expect(rules.sitemap).toContain('sitemap.xml');

    const rulesList = Array.isArray(rules.rules) ? rules.rules : [rules.rules];
    expect(rulesList.length).toBeGreaterThan(0);
    const mainRule = rulesList[0];

    expect(mainRule).toBeDefined();
    if (mainRule) {
      expect(mainRule.allow).toContain('/');
      expect(mainRule.allow).toContain('/how-it-works');
      expect(mainRule.allow).toContain('/about');
      expect(mainRule.allow).toContain('/help');
      expect(mainRule.allow).toContain('/privacy');
      expect(mainRule.allow).toContain('/terms');
      expect(mainRule.disallow).toContain('/scan/');
      expect(mainRule.disallow).toContain('/review/');
      expect(mainRule.disallow).toContain('/result/');
      expect(mainRule.disallow).toContain('/shares/');
      expect(mainRule.disallow).toContain('/history/');
      expect(mainRule.disallow).toContain('/api/');
    }
  });
});
