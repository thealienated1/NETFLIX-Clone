import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../Logo';

describe('Logo Component', () => {
  test('renders logo image', () => {
    render(<Logo />);
    const logoImage = screen.getByAltText(/netflix logo/i);
    expect(logoImage).toBeInTheDocument();
  });

  test('logo has correct src attribute', () => {
    render(<Logo />);
    const logoImage = screen.getByAltText(/netflix logo/i);
    expect(logoImage).toHaveAttribute('src', '/netflix-logo.png');
  });
}); 