import { render, screen } from '@testing-library/react';
import App from './App';

test('renders site title', () => {
  render(<App />);
  const title = screen.getByText(/ポケモン対戦情報サイト/i);
  expect(title).toBeInTheDocument();
});
