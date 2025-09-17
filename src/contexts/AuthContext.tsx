import { createContext, useState, useContext, type ReactNode } from "react";
import { users, type User } from "@/data/seed";

interface AuthContexType{
    user: User | null;
    login: (email: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContexType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);

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
