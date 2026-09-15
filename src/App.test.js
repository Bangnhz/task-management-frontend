import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in screen by default', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /sign in/i });
  expect(titleElement).toBeInTheDocument();
});
