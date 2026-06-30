import { AUDIT_KEY, Audit } from './audit.decorator';

describe('@Audit decorator', () => {
  it('should set audit metadata on a method', () => {
    const mockFn = () => {};
    const metadata = { action: 'product.price.updated', resource: 'Product' };

    Audit(metadata)({}, 'test', { value: mockFn, writable: true, enumerable: true, configurable: true });

    const actual = Reflect.getMetadata(AUDIT_KEY, mockFn);
    expect(actual).toEqual(metadata);
  });
});
