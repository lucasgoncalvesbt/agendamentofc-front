import React, { createContext, ReactNode, useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import api from '../services/api';
import { useHistory } from 'react-router-dom';

type User = {
  id: number;
  nome: string;
  email: string;
}

type Decoded = {
  sub: number;
  email: string;
  nome: string;
}

type AuthContextType = {
  user: User | undefined;
  userIsAuthenticated: boolean;
  login(email: string, senha: string, callback: Function): Promise<void>;
  logout(): void;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthContextProvider(props: AuthContextProviderProps) {
  const history = useHistory();
  const [user, setUser] = useState<User>();
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  useEffect(() => {
    function onLoad() {
      const token = sessionStorage.getItem('token');
      if (token) {
        const decoded = jwt_decode(token) as Decoded;
        setUser({
          id: decoded.sub,
          email: decoded.email,
          nome: decoded.nome
        })
        setUserIsAuthenticated(true);
      } else {
        setUser(undefined);
        history.push('/login')
      }
    };
    onLoad();
  }, [])

  const login = async (email: string, senha: string, callback: Function) => {
    const { data: { token } } = await api.post('/auth/sign', {
      email: email,
      senha: senha
    })
    sessionStorage.setItem('token', token)
    const decoded = jwt_decode(token) as Decoded;
    setUser({
      id: decoded.sub,
      email: decoded.email,
      nome: decoded.nome
    })
    callback();
  }

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(undefined);
    history.push('/login')
    console.log("logout")
  }

  return (
    <AuthContext.Provider value={{ user, userIsAuthenticated, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
}