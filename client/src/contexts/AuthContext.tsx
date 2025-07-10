import React, { createContext, useState } from 'react';
import type { UserDtoType } from '../../../shared/dtos/user.dto';

type AuthContextType = [UserDtoType | null, (user: UserDtoType | null) => void];

export const AuthContext = createContext<AuthContextType>([null, () => {}]);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<UserDtoType | null>(null);

	return (
		<AuthContext.Provider value={[user, setUser]}>
			{children}
		</AuthContext.Provider>
	);
};
