import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('app routing facade', () => {
  it('delegates dashboard composition to pages-flat', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/app/(dashboard)/layout.tsx'), 'utf8');
    expect(source).toContain("from '@/pages-flat/dashboard-layout'");
    expect(source).not.toContain("from '@/widgets/header'");
    expect(source).not.toContain("from '@/shared/lib'");
  });
});
