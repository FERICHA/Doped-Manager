import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('JwtToken');
  if (!token) return null;
  return decodeToken(token);
};

export const getUserId = () => {
  const user = getCurrentUser();
  return user ? user.id : null;
};

export const getSession = () => {
  const user = getCurrentUser();
  return user ? user.session : null;
};
