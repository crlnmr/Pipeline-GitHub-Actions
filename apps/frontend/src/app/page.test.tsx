import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(<HomePage />);
    expect(screen.getByText('e-micro-commerce')).toBeInTheDocument();
  });
});
