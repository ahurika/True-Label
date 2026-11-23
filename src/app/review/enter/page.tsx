'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Stack } from '@/components/layout';
import { Button } from '@/components/ui';
import { FormField, RegistrationNumberInput, TextInput } from '@/components/forms';
import { getPackSession, setPackSession } from '@/lib/session/pack-store';
import { ProductCategory } from '@/domain/types';

/**
 * Screen C05: Enter packaging details manually (PRD v4.0 §5 Step 6)
 * Starts with empty input (zero hardcoded mock data).
 * Follows exact same validation, comparison, and verdict rules as image scan.
 */
export default function EnterDetailsPage() {
  const router = useRouter();

  const [regNo, setRegNo] = useState('');
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batch, setBatch] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<ProductCategory>('medicine');
  const [medicineStrength, setMedicineStrength] = useState('');

  useEffect(() => {
    const session = getPackSession();
    if (session.hasActiveScan) {
      if (session.registrationNumber) setRegNo(session.registrationNumber);
      if (session.brand) setBrand(session.brand);
      if (session.productName) setProduct(session.productName);
      if (session.manufacturer) setManufacturer(session.manufacturer);
      if (session.batchNumber) setBatch(session.batchNumber);
      if (session.expiryDate) setExpiryDate(session.expiryDate);
      if (session.category) setCategory(session.category);
      if (session.medicineStrength) setMedicineStrength(session.medicineStrength);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) return;

    setPackSession({
      registrationNumber: regNo.trim(),
      brand: brand.trim(),
      productName: product.trim(),
      manufacturer: manufacturer.trim(),
      batchNumber: batch.trim(),
      expiryDate: expiryDate.trim(),
      category,
      medicineStrength: medicineStrength.trim(),
      hasActiveScan: true,
      isManuallyEntered: true,
      isNumberConfirmed: false,
      isIdentityConfirmed: false,
      isStrengthConfirmed: false,
      verdictResult: null,
    });

    router.push('/review');
  };

  return (
    <AppShell
      headerProps={{
        title: 'Type printed details',
        backHref: '/scan',
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="default" className="tl-mt-2">
          <div className="tl-caption tl-text-muted">Manual Packaging Entry</div>

          <div>
            <h1 className="tl-title-1">Enter printed details</h1>
            <p className="tl-body tl-text-muted tl-mt-1">
              Check every letter and number carefully against your physical packaging.
            </p>
          </div>

          <FormField
            label="Product Category"
            hint="Select the category that matches this pack"
            htmlFor="category"
          >
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="tl-input"
              style={{ width: '100%', height: '44px', padding: '0 12px' }}
            >
              <option value="medicine">Medicine (Pharmaceuticals / Drugs)</option>
              <option value="food">Packaged Food</option>
              <option value="beverage">Beverage &amp; Drinks</option>
              <option value="water">Bottled / Sachet Water</option>
              <option value="cosmetic">Cosmetics &amp; Skincare</option>
              <option value="toothpaste">Toothpaste &amp; Oral Hygiene</option>
              <option value="household">Household Chemical / Cleaning (Alert check only)</option>
              <option value="other">Other Commercial Pack</option>
            </select>
          </FormField>

          <FormField
            label="Registration number"
            hint="Printed NAFDAC number (e.g. 04-1234, 01-0812, A0-1234)"
            htmlFor="regNo"
          >
            <RegistrationNumberInput
              id="regNo"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value.toUpperCase())}
              placeholder="e.g. 04-1234"
              required
            />
          </FormField>

          <FormField
            label="Brand name"
            hint="Primary brand printed on the pack"
            htmlFor="brand"
          >
            <TextInput
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Emzor, Golden Penny"
              required
            />
          </FormField>

          <FormField
            label="Product name"
            hint="Specific product title or description"
            htmlFor="product"
          >
            <TextInput
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Paracetamol 500mg Tablets"
              required
            />
          </FormField>

          <FormField
            label="Manufacturer"
            hint="Company name printed on pack"
            htmlFor="manufacturer"
          >
            <TextInput
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Emzor Pharmaceutical Industries Ltd"
            />
          </FormField>

          {category === 'medicine' && (
            <FormField
              label="Medicine Strength"
              hint="Active strength printed on medicine box or blister (e.g. 500mg, 20/120mg)"
              htmlFor="medicineStrength"
            >
              <TextInput
                id="medicineStrength"
                value={medicineStrength}
                onChange={(e) => setMedicineStrength(e.target.value)}
                placeholder="e.g. 500mg"
              />
            </FormField>
          )}

          <div className="tl-cluster" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FormField
                label="Batch / Lot Number"
                hint="Printed batch code (for recall check)"
                htmlFor="batch"
              >
                <TextInput
                  id="batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value.toUpperCase())}
                  placeholder="e.g. B2026-01"
                />
              </FormField>
            </div>

            <div style={{ flex: 1 }}>
              <FormField
                label="Expiry Date"
                hint="e.g. 11/2027 or 2027-11-30"
                htmlFor="expiryDate"
              >
                <TextInput
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="e.g. 11/2027"
                />
              </FormField>
            </div>
          </div>

          <div className="tl-mt-2 tl-stack-tight">
            <Button variant="primary" fullWidth type="submit" disabled={!regNo.trim() || !brand.trim() || !product.trim()}>
              Review details
            </Button>
            <Button variant="ghost" fullWidth type="button" onClick={() => router.push('/scan/capture')}>
              Use camera instead
            </Button>
          </div>
        </Stack>
      </form>
    </AppShell>
  );
}
