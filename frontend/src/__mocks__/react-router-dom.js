export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const MemoryRouter = ({ children }) => <div>{children}</div>;
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/' });
export const Link = ({ children, to }) => <a href={to}>{children}</a>;
