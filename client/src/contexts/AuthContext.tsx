import React, { createContext, useState } from 'react';
import type { UserDto } from '../../../shared/dtos/user.dto';

type AuthContextType = [UserDto | null, (user: UserDto | null) => void];

export const AuthContext = createContext<AuthContextType>([null, () => {}]);

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<UserDto | null>(null);

	return (
		<AuthContext.Provider value={[user, setUser]}>
			{children}
		</AuthContext.Provider>
	);
};
