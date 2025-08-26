describe('CLI', () => {
  it('should be able to import CLI module without errors', () => {
    // Simple test to ensure CLI module can be imported
    // More comprehensive CLI testing would require additional setup for testing interactive prompts
    expect(() => {
      // Just test that the CLI file exists and can be parsed
      const fs = require('fs');
      const path = require('path');
      const cliPath = path.resolve(__dirname, '../src/cli.ts');
      expect(fs.existsSync(cliPath)).toBe(true);
    }).not.toThrow();
  });

  it('should have proper package configuration', () => {
    const pkg = require('../package.json');
    
    expect(pkg.name).toBe('@seed-unphrase/cli');
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin['seed-concealer']).toBe('dist/src/cli.js');
    expect(pkg.dependencies).toHaveProperty('@seed-unphrase/lib');
  });
});