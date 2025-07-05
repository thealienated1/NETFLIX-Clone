import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../Logo';
import { MemoryRouter } from 'react-router-dom';

describe('Logo Component', () => {
  test('renders logo image', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    const logoImage = screen.getByAltText(/netflix logo/i);
    expect(logoImage).toBeInTheDocument();
  });

  test('logo has correct src attribute', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    const logoImage = screen.getByAltText(/netflix logo/i);
    expect(logoImage).toHaveAttribute('src', '/assets/netflix-logo.png');
  });
}); 