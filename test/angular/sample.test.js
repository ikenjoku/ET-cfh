/**
 * Sample test
 */
import { expect } from 'chai';

describe('Sample test to ensure karma config works', () => {
  it('should pass', () => {
    expect(1).to.equal(1);
  });
  it('should fail', () => {
    expect(2).to.not.equal(1);
  });
});
