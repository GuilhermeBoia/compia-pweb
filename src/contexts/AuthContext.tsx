import { createContext, useState, useContext, type ReactNode, useEffect } from "react";
import { users, type User } from "@/types/user";

interface AuthContexType{
    user: User | null;
    login: (email: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContexType | undefined>(undefined);

const STORAGE_KEY = 'auth_user';

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const login = (email: string): boolean =>{
        const foundUser = users.find(u => u.email === email);
        if (foundUser) {
            setUser(foundUser);
            return true
        }else{
            alert("Usuário não encontrado!")
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value = {{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
