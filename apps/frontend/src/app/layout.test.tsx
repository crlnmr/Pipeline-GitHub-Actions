import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders children', () => {
    render(<RootLayout><div>test child</div></RootLayout>);
    expect(screen.getByText('test child')).toBeInTheDocument();
  });
});
